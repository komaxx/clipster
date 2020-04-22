# Clipster

A minimal web-based online clipboard. In case you have multiple machines you have to work on - and at least one of them is in a VPN, so none of the local IP solutions work.

Roll/deploy your own instance (everything you need is in here), or use the one hosted here: [Clipster](https://clipster.matthiasschicker.de). Note that the latter one is also my playground. May go away at any time. Do not store stuff in here that you'd like to keep.

## Main packages:

### 1. The `frontend`
Web App built on Angular 9 with some material design components sprinkled in.

### 2. `cloud_functions`
Firebase cloud functions. To maintain the database and handle file uploads

### 3. `rules`
Simple rule file that defines what clients can and can not do in the database.

# Run you own (build / deploy)

Easy enough, probably.

## First: Set up Firebase

You'll need a Google account for that. Go to the [Firebase console](https://console.firebase.google.com/u/0/) and create a new project.
Then you need the command line tools for Firebase ([here](https://www.npmjs.com/package/firebase-tools)) and run 
```
firebase login
```
Now you can deploy your stuff right from your command line!


## Frontend
#### Configure
You'll need to tell the web app to which Firebase app it should talk. That is done through the `frontend/environments/firebaseConfig.ts` files. Create that file, copy the content of the `firebaseConfig.demo.ts` file in there and replace all the dummy fields with the one you can see in the Firebase Console page when you tap on 'settings'.

#### Build
Here, you'll need [Angular 9](https://angular.io/) installed on your machine. 
Once that is in place, open the `frontend` folder in your preferred shell and run
```
ng build --prod
```
That creates a new folder `dist` with the compiled web app, ready to be deployed.

#### Deploy
Open the `frontend` folder and run
```
firebase init
```
When asked, choose 'use existing project', pick your already created Firebase project and only select the 'hosting' option.

Now we're all set and deploy the frontend! Run:
```
firebase deploy
```
From then on, your web-app should be reachable. You can find the URL in the `hosting` tab of the Firebase console. Probably not a lot will work, though, until cloud functions and rules are in place as well.

### Cloud functions
If you've already done everything for the frontend, this will be much easier. Just open the `cloud_functions` folder, and run:
* `firebase init` : Similar to above but this time just pick the 'functions' option
* `firebase deploy`

***Note***: When you're planning on running this in a larger scale, you might want to change the region where you functions run in `index.ts` file away from Europe and closer to your users.

### Rules
Same as with the cloud functions, just pick the 'Firebase' option this time ("Firebase", *not* Firestore)

### Done

# FAQ
#### Contribute?
Please! Suggestions, PRs, issues: All welcome!

#### That code could be cleaner
Yes. Needed this tool quickly, so wrote it quickly. Also, I'm more of a native guy, so I'm probably using some of the web tech wrong.

#### Why didn't you use [insert your shtick here]?
Probably should have. Just used the tools at hand.

#### License?
MIT. ("Do whatever")

#### Could this run on a different backend?
Absolutely. User handling and data synchronization alone would probably be a bigger project than this is, though.