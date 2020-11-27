### 11/27/2020
I developed this code just over a year and a half ago. At that time this app's main issue was the bad persistence. Also there was no interface to view other entries.
Since the pandemic I haven't gone to the gym I used to go about 5 days a week. I've since put on about 30lbs and I've been losing form, becoming this featureless mass of meat.
I have since developed a native-like app by PWA for TaggingTracker a local group I contribute to. The app uses Dexie a wrapper around IndexedDB, that makes interfacing with a sql-like database really nice with persistence. I will add that to this project.
Then hopefully I will actually follow through and start dieting. I drink NOS almost religiously and RedBull.

I suppose this is a characteristic of bad code when there is an overhead to making a seemingly simple change(data store).
The issue is the state management in particular I believe everything was done synchronously with the local/session storage approaches.
Dexie is async and need promises "to make it synchronous"

This is old as it's class-based, I've done everything in functional now.

This is kind of low on my priority too regarding what to commit my "fresh brain" to.
But I really need to start dieting because I'm getting to that point of "annoying inner tube around my gut" feeling again.

I'll try it, give myself an hour to run through the code and remember how it works then drop in an IndexedDB schema/init and replace the load/save processes to use it.

### 09/27/2020

Having a hard time starting/doing the work. I know what I have to do but don't want to ha. Switched it to `localStorage` will deploy to a website and load it up on my phone again to see it.