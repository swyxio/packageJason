### This is Jason.
<img src="public/packagejason.png" alt="Drawing" style="width: 200px;"/>

Jason is a mailman who likes to compete in hackathons and make side projects in his spare time.

However he wastes a lot of time evaluating boilerplates and starter kits arbitrarily.

This makes Jason a sad mailman.

Help Jason rate boilerplates.

# Introducing PackageJason
A hackathon/starter kit/boilerplate rating engine. 

- SEARCH: Search open source boilerplates by desired stack (we crawl the `package.json` for you... geddit? eh? no laughs? tough crowd.)
- FAVE: Keep a list of your favorites you can come back to and use
- SCORE: Rapidly evaluate the **cognitive load** of any boilerplate you come across!

<img src="public/boilerplatesearchdependencies.gif" alt="Demo gif" style="width: 400px;"/>

### With his new boilerplate skills, Jason even has time to ask Package Jane out on a date!

<img src="public/packagejane.png" alt="Drawing" style="width: 200px;"/>

### Will she accept? Stay tuned!

---

# Contributors

[Public trello board here.](https://trello.com/b/u28EAYJ5/swyx-boilerpl8). Chat with maintainer on twitter [@swyx](http://twitter.com/swyx).

# FAQ

**What is cognitive load?**

Cognitive load is 50% External Load and 50% Internal Load.

- External Load = Number of root deps + (Total number of all deps + Number of root devDeps)
- Internal Load = Number of files and folders + Total filesize of Javascript files
- _"deps" here mean "dependencies" in case it wasn't obvious_

We contrast this with a Popularity Score (adopting the approach of [npms.io](http://npms.io)) to achieve a quantifiable tradeoff of cost/benefit.

**So how do I use this thing?**

You can't. Package Jason is still working on it. This isn't launched yet. However we appreciate your interest. 

**So is "Package" a title or a job description or a last name or...?**

Yes

---

[Base boilerplate taken from cleverbeagle/pup](http://cleverbeagle.com/pup)
