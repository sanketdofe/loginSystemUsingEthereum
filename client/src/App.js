import React, { useState } from 'react';
import axios from 'axios';
import './App.css';


function App() {
  
  const [message, setMessage] = useState('');
  const [address, setAddress] = useState('');
  const [gettingChallenge, setGettingChallenge] = useState(false);
  const [challengeRecieved, setChallengeRecieved] = useState('');
  const [challenge, setChallenge] = useState('');
  const [token, setToken] = useState('');
  const [challengeVerifying, setChallengeVerifying] = useState(false);
  const [loggedIn, setloggedIn] = useState(false);

  function handleAddressChange(event){
    setAddress(event.target.value);
  };

  function handleChallengeChange(event){
    setChallenge(event.target.value);
  };

  function handlePreLoginButton(event) {
    axios
    .post('http://localhost:5000/login', {address: address})
    .then((res)=>{
      console.log(res.data);
      setMessage(res.data.message);
      if(res.data.message === "Address is not valid") {
        setAddress("");
        setGettingChallenge(false);
        return;
      } else {
        setGettingChallenge(true);
        setChallengeRecieved(res.data.challenge);
        setToken(res.data.token);
      }
    });
  }

  function handlePostLoginButton(event) {
    axios
    .post('http://localhost:5000/confirmLogin', {token: token, challenge: challenge})
    .then(res => {
      setMessage(res.data.message);
      if(res.data.message === "Not authenticated by contract till now"){
        setChallengeVerifying(true);
        setTimeout(handlePostLoginButton(event), 2000);
      }else{
        setChallengeVerifying(false);
        setloggedIn(true);
        localStorage.setItem("loginSystemToken", res.data.token);
      }
    });
  }

  function handleLogoutButton(event) {
    localStorage.removeItem("loginSystemToken");
    setAddress("");
    setChallenge("");
    setChallengeRecieved("");
    setChallengeVerifying(false);
    setToken("");
    setMessage("");
    setGettingChallenge(false);
    setloggedIn(false);
  }

  const preLogin = <div>
    <h1>Login</h1>
    <div>
      <label for="address">Enter Address: </label>
      <input value={address} onChange={handleAddressChange} type="text" id="address"></input>
    </div>
    <button className="elementmargin" onClick={handlePreLoginButton}>Login</button>
  </div>


  const postLogin = <div>
    <h1>Validate Login</h1>
    <h4>Challenge: <em>{challengeRecieved}</em></h4>
    <div>
      <label for="challenge">Enter Challenge String: </label>
      <input value={challenge} onChange={handleChallengeChange} type="text" id="challege"></input>
    </div>
    <button className="elementmargin" onClick={handlePostLoginButton}>Validate Login</button>
  </div>

  const logoutForm = <div>
    <h1>Logged In Successfully</h1>
    <p>Address: {address}</p>
    <button className="elementmargin" onClick={handleLogoutButton}>Logout</button>
  </div>

  const messageDiv = <div>
    <p>Message: {message}</p>
  </div>

  return (
    <div className="App">
      <div className="center">
        {message==="" ? "" : messageDiv}
        {!gettingChallenge && !challengeVerifying ? preLogin : !loggedIn ? postLogin : logoutForm}
      </div>
    </div>
  );
}

export default App;
