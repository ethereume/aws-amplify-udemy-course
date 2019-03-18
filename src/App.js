import React, { Component } from 'react';
import {withAuthenticator} from "aws-amplify-react";
import {API,graphqlOperation} from 'aws-amplify';
import {createNote} from "./graphql/mutations";
import {listNotes} from "./graphql/queries";

class App extends Component {
  
  state = {
  	note:"",
  	notes:[]
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
  	const {note} = this.state;
  	let input = {note}

  	const result = await API.graphql(graphqlOperation(createNote,{input}));

  	this.setState(prevState=>({
  		notes:[...prevState.notes,result.data.createNote],
  		note:""
  	}));

  }
  render() {
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
      	<h1 className="code f2-1">Amplify</h1>
      	<form onSubmit={this.save.bind(this)} className="mb3">
      		<input type="text" className="pa2 f4" placeholder="Write your note" value={this.state.note} onChange={this.changeValue.bind(this)} />
      		<button type="submit" className="pa2 f4">Wyślij notkę</button>
      	</form>
      	<div>
	      	<ul>
	      		{this.state.notes.map(({id,note})=>{
	      			return (
	      				<div className="flex items-center">
	      					<li className="list pa1 f3" key={id}> {note} </li>
	      					<span>&times;</span>
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
