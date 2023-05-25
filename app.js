const express = require("express");
const bodyParser = require("body-parser");
const client = require("@mailchimp/mailchimp_marketing");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",function(req,res){
    res.sendFile(__dirname + "/signup.html");
})

app.use(express.static("public"));


//using async
app.post("/", function(req,res){
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;
    
    client.setConfig({
        apiKey: "5a84a7dbb62d269ab1d1d7ccf1f06068-us14",
        server: "us14",
      });
          
      const run = async () => {

        const reply = await client.ping.get();
        const response = await client.lists.batchListMembers("e8e22b8b40", {

          members: [
                        {  email_address: email,
                             status: "subscribed",
                            merge_fields: {
                                 FNAME: firstName,
                                LNAME: lastName,
                            }
                        }
                            ]
        });

        console.log(response);
          
      if (response.new_members[0].status === "subscribed" ) {
        res.sendFile(__dirname + "/success.html");
    } else  {
        res.sendFile(__dirname + "/failure.html");
    };
      };
      
      run();    
});


app.post("/success.html", function(req,res){
    res.redirect("/")
   });
   
   app.post("/failure.html", function(req,res){
       res.redirect("/")
      });




app.listen(process.env.PORT || 3003,function(){
    console.log("server is running on port 3003")
})

//APIKEY: 5a84a7dbb62d269ab1d1d7ccf1f06068-us14
//ListID: e8e22b8b40



// const request = require("request");
// const { urlencoded } = require("body-parser");
// const https = require ("https");

// app.post("/",function(req,res){
//     const firstName = req.body.fName;
//     const lastName = req.body.lName;
//     const email = req.body.email;
    
//     const data = {
//         members:[
//             {
//                 email_address: email,
//                 status: "subscribed",
//                 merge_fields: {
//                     FNAME: firstName,
//                     LNAME: lastName
//                 }
//             }
//         ]
//     };
//     const  jsonData = JSON.stringify(data);

//     const url = "https://us14.api.mailchimp.com/3.0/lists/e8e22b8b40";

//     const options={
//         method:"POST",
//         auth:"goodness2:5a84a7dbb62d269ab1d1d7ccf1f06068-us14"
//     }

//     const request = https.request(url,options,function(response){
    //   if (response.statusCode === 200 ) {
    //     res.sendFile(__dirname + "/success.html");
    // } else {
    //     res.sendFile(__dirname + "/failure.html");
    // };
//         response.on("data",function(data){
//             console.log(JSON.parse(data));
//         })
        

//       request.write(jsonData);
//       request.end();

//     })

// });