const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cuid = require("cuid");
const Web3 = require("web3");

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());


const challengesSentToUser = {};
const userLoginSucess = {};

/////////////////////Web3.js instance for Login Contract//////////////////////
const web3 = new Web3("ws://localhost:8545");
const loginAbi = require("../logincontract/build/contracts/Login.json");
const LoginContract = new web3.eth.Contract(loginAbi.abi, process.env.CONTRACT_ADDRESS);


//Checking the event for validating challenges
LoginContract.events.TryLogin((error, event) => {
    if(error) {
        console.log(error);
        return;
    }

    console.log(event);

    if(challengesSentToUser[event.args.sender.toLowerCase()] === event.args.challenge) {
        userLoginSucess[event.args.sender.toLowerCase()] = true;
    }
});


/////////////////////////////Routes////////////////////////////////////
app.post('/login', (req, res) => {
    if(!req.body.address || !web3.utils.isAddress(req.body.address)) {
        res.send({message: "Address is not valid"});
        return;
    }

    var challenge = cuid();
    challengesSentToUser[req.body.address.toLowerCase()] = challenge;

    const token = jwt.sign({ 
        address: req.body.address, 
        stage: "prelogin"
    }, process.env.SECRET_KEY);

    res.json({
        challenge: challenge,
        token: token
    });
});


function verifyJWT(req, res, next){
    // console.log(req.body);
    if(req.body.token === undefined || req.body.token === null){
        res.send({message: "JWT token required"});
        return;
    }
    else{
        jwt.verify(req.body.token, process.env.SECRET_KEY, function(err, decoded) {
            if(err){
                // console.log(err);
                res.send(err);
            }
            else{
                res.locals.decodedjwt = decoded;
                next();
            }
        });
    }
}

app.post('/confirmLogin', verifyJWT, (req, res) => {
    if(!res.locals.decodedjwt || !res.locals.decodedjwt.address || res.locals.decodedjwt.stage !== "prelogin") {
        res.send({message: "JWT token data not proper"});
        return;
    }

    if(userLoginSucess[res.locals.decodedjwt.address]) {
        delete userLoginSucess[res.locals.decodedjwt.address];
        delete challengesSentToUser[res.locals.decodedjwt.address];

        const token = jwt.sign({ 
            address: res.locals.decodedjwt.address, 
            access: 'postlogin'
        }, process.env.SECRET_KEY);

        res.json({
            token: token,
            address: res.locals.decodedjwt.address
        });
    } else {
        res.send({message: "Not authenticated by contract till now"});
    }
});



app.listen(process.env.PORT || "5000", function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Server is up on port 5000");
    }
}); 