const express = require('express');
const bodyParser = require('body-parser');
const client = require('@mailchimp/mailchimp_marketing');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/signup.html');
});

app.use(express.static('public'));

//using async
app.post('/', function (req, res) {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  client.setConfig({
    //Api key would be revoked by mailchimp when published as a public repository
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER,
  });

  const run = async () => {
    try {
      const response = await client.lists.batchListMembers(
        process.env.MAILCHIMP_LIST_ID,
        {
          members: [
            {
              email_address: email,
              status: 'subscribed',
              merge_fields: {
                FNAME: firstName,
                LNAME: lastName,
              },
            },
          ],
        }
      );

      console.log(response);

      //Takes you to either success or failure page.

      if (response.new_members && response.new_members.length > 0) {
        if (response.new_members[0].status === 'subscribed') {
          res.sendFile(__dirname + '/success.html');
        } else {
          res.sendFile(__dirname + '/failure.html');
        }
      } else if (response.errors && response.errors.length > 0) {
        // Check if the error is related to the email already existing or something else
        const emailAlreadyExistsError = response.errors.find(
          (error) => error.error_code === 'ERROR_CONTACT_EXISTS'
        );

        if (emailAlreadyExistsError) {
          console.error('Email already exists:', emailAlreadyExistsError);
          res.sendFile(__dirname + '/emailexists.html'); // Custom page for email already exists
        } else {
          console.error('Error from Mailchimp:', response.errors);
          res.sendFile(__dirname + '/failure.html'); // Handles other errors like invalid email
        }
      } else {
        res.sendFile(__dirname + '/failure.html'); // Handle unexpected cases
      }
    } catch (error) {
      console.error('Error occurred:', error);
      res.sendFile(__dirname + '/failure.html');
    }
  };

  run();
});

//redirects you to homepage.
app.post('/success.html', function (req, res) {
  res.redirect('/');
});

app.post('/failure.html', function (req, res) {
  res.redirect('/');
});

app.listen(process.env.PORT || 3003, function () {
  console.log('server is running on port 3003');
});

//APIKEY should look like this => 5a84a7dbb62d269ab1d1d7ccf1f06068-us14
//ListID hould look like this => e8e22b8b40
// aa02c8958992eab8dbf9c475f3dba23a-us17
