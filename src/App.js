import React, { Component } from 'react';
import {withAuthenticator} from "aws-amplify-react";
import {API,graphqlOperation} from 'aws-amplify';
import {createNote,deleteNote,updateNote} from "./graphql/mutations";
import {listNotes} from "./graphql/queries";

class App extends Component {
  
  state = {
  	id:null,
  	note:"",
  	notes:[],
  	title:"Dodaj notkę"
  }

  async componentDidMount() {
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
  		console.log(node);
		 let notes = this.state.notes.map((dane)=>{
				if(dane.id === id){
					return node.data.updateNote;
				} else {
					return dane;
				}
	  	});
	  	this.setState({
	  		notes,
	  		title:"Dodaj notatkę",
	  		id:null
	  	});
  	} else {
  		const result = await API.graphql(graphqlOperation(createNote,{input}));

	  	this.setState(prevState=>({
	  		notes:[...prevState.notes,result.data.createNote],
	  		note:""
	  	}));
  	}
  }
  async deleteNode(id){
  	let notes = this.state.notes.filter((dane)=>{
  		return dane.id !== id;
  	});
  	let input = {id};
  	await API.graphql(graphqlOperation(deleteNote,{input})); 
  	this.setState({
  		notes
  	})
  }
async update(id,name){
	this.setState({
		note:name,
		title:"Edytuj notatkę",
		id
	});
  }
  render() {
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
      	<h1 className="code f2-1">Amplify</h1>
      	<form onSubmit={this.save.bind(this)} className="mb3">
      		<input type="text" className="pa2 f4" placeholder="Write your note" value={this.state.note} onChange={this.changeValue.bind(this)} />
      		<button type="submit" className="pa2 f4">{this.state.title}</button>
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
