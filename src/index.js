import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Amplify from "aws-amplify";
import awsmobile from "./aws-exports";
Amplify.configure(awsmobile)

ReactDOM.render(<App />,document.getElementById('root'));
