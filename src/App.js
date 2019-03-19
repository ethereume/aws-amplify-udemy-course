import React, { Component } from 'react';
import {withAuthenticator} from "aws-amplify-react";
import {API,graphqlOperation} from 'aws-amplify';
import {createNote,deleteNote,updateNote} from "./graphql/mutations";
import {listNotes} from "./graphql/queries";
import {onCreateNote,onDeleteNote} from "./graphql/subscriptions";

class App extends Component {
  
  state = {
  	id:null,
  	note:"",
  	notes:[]
  }

  async componentDidMount() {
  	this.getNoted();
  	this.createNotesListener = API.graphql(graphqlOperation(onCreateNote)).subscribe({
  		next:noteData => {
  			const newNote = noteData.value.data.onCreateNote;
  			const prevNotes = this.state.notes.filter((dane)=>{
  				return dane.id !== newNote.id;
  			});
  			const updateNote = [...prevNotes,newNote];
  			this.setState({
  				notes:updateNote
  			})
  		}
  		
  	});
  	this.deleteNotesListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
  		next:noteData =>{
  			const index = this.state.notes.findIndex((dane)=> dane.id === noteData.value.data.onDeleteNote.id);
  			const {notes} = this.state
  			const notesNew = [
  				...notes.splice(0,index),
  				...notes.splice(index+1)
  			];
  			console.log(notesNew);
  			this.setState({
  				notes:notesNew
  			})
  		}
  	});
  }
  componentWillUnmount(){
  	this.createNotesListener.unsubscribe();
  	this.deleteNotesListener.unsubscribe();
  }
  getNoted = async () =>{
	const result = await API.graphql(graphqlOperation(listNotes));
	  	this.setState({
	  		notes:result.data.listNotes.items
	  	});
  }

  changeValue(event){
  	this.setState({
  		note:event.target.value
  	});
  }
   save = async event =>{
  	event.preventDefault();
  	const {note,id} = this.state;
  	let input = {id,note}
  	if(id != null){
  		const node = await API.graphql(graphqlOperation(updateNote,{input}));
  		let index = this.state.notes.findIndex(item => item.id === node.data.updateNote.id);

  		 let {notes} = this.state;
		 let notesTmp = [
		 	...notes.slice(0,index),
		 	node.data.updateNote,
		 	...notes.slice(index+1)
		 ]
	  	this.setState({
	  		notes:notesTmp,
	  		id:null
	  	});
  	} else {
  		await API.graphql(graphqlOperation(createNote,{input}));
	  	this.setState({	note:""});
  	}
  }
  async deleteNode(id){
  	let notes = this.state.notes.filter((dane)=>{
  		return dane.id !== id;
  	});
  	let input = {id};
  	await API.graphql(graphqlOperation(deleteNote,{input})); 
  	/*this.setState({
  		notes
  	})*/
  }
async update(id,name){
	this.setState({
		note:name,
		id
	});
  }
  render() {
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
      	<h1 className="code f2-1">Amplify</h1>
      	<form onSubmit={this.save.bind(this)} className="mb3">
      		<input type="text" className="pa2 f4" placeholder="Write your note" value={this.state.note} onChange={this.changeValue.bind(this)} />
      		<button type="submit" className="pa2 f4">{this.state.id ? "Edytuj notatkę ": "Dodaj notatkę"}</button>
      	</form>
      	<div>
	      	<ul>
	      		{this.state.notes.map(({id,note})=>{
	      			return (
	      				<div className="flex items-center">
	      					<li onClick={()=>this.update(id,note)} className="list pa1 f3" key={id}> {note} </li>
	      					<span onClick={(e)=>{
	      						e.stopPropagation();
	      						this.deleteNode(id);
	      					}}>&times;</span>
	      				</div>
	      			)
	      		})}
	      	</ul>
	    </div>
      </div>
    );
  }
}

export default withAuthenticator(App,{includeGreetings:true});
