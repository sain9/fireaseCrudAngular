import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import 'firebase/database';
import { Student } from './student.model';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public studentsList!: Student[];
  displayedColumns: string[] = ['index', 'name', 'age', 'score', 'btn'];
  public filteredStudents!: MatTableDataSource<Student>;
  filterValue!: string;//search input for score 

  public toppersDataSource!: MatTableDataSource<Student>;

  title = 'Firebase_realtimeDb';

  public winnersList!: Student[];
  winnersDisplayedColumns: string[] = ['index', 'name',  'score', 'btn'];
  
constructor(private db: AngularFireDatabase){
  this.getStarted();
}

async getStarted(){

  var students: Student[];
  var winners: Student[];

  await this.geStudents().then( value => {
    students = value as Student[];
    this.studentsList = students;
  });
   this.filteredStudents = new MatTableDataSource<Student>(
    this.studentsList.filter(student => student.age && student.age < 21)
    );

  this.toppersDataSource = new MatTableDataSource<Student>(
    this.studentsList.filter(student => student.score && student.score > 90)
  );
  console.log(this.studentsList);

//winners section
  await this.getWinners().then( value => {
    winners = value as Student[];
    this.winnersList = winners;
  });
    console.log(this.winnersList);
}

//get students node from databse
geStudents(){
  return new Promise( (resolve,reject) => {
    this.db.list('students').valueChanges().subscribe( value=> {
      resolve(value);
    });
  });
}

//get winners from database
getWinners(){
  return new Promise( (resolve,reject) => {
    this.db.list('winners').valueChanges().subscribe( value=> {
      resolve(value);
    });
  });
}

applyScoreFilter() {
  this.filteredStudents.filter = this.filterValue.trim().toLowerCase();
  this.filteredStudents.filterPredicate = (student: Student, filter: string) => {
    const scoreString = student.score ? student.score.toString() : '';
    return scoreString.includes(filter);
  };
}

//add to winner
async addWinner(student: Student) {

  try {
    await this.db.object('winners/' + student.id).set({
      name: student.name,
      score: student.score
    });
    console.log('Student added to winners:', student);
  } catch (error) {
    console.log('Adding winner error:', error);
  }
  finally{
    this.getStarted();
  }

}

//confirm to push to winner/ 
confirmAddWinner(student: Student) {
  const confirmResult = confirm(`Add ${student.name} to winners?`);
  
  if (confirmResult) {
    this.addWinner(student);
  }
}

//delete
async deleteWinner(index: number) {
  try {
    
    const winner = this.winnersList[index]; // Get the winner object at the specified index
    
    const snapshot = await this.db.database.ref('winners')
      .orderByChild('name')
      .equalTo(winner.name)
      .once('value');

    if (snapshot.exists()) {
      const winnerKey = Object.keys(snapshot.val())[0];
      await this.db.object(`winners/${winnerKey}`).remove();
      console.log('Winner successfully deleted!'+Object.keys(snapshot.val())[0]);
      
    }
  } catch (error) {
    console.error('Error deleting winner:', error);
  } finally {
    this.getStarted();
  }
}


}
