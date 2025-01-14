# Movie Wizard
#### Video Demo:  <  https://youtu.be/YWIYZWkl66I >
## The Movie Wizard is a website that serves as your cinematic compass, providing personalized film suggestions based on your favorites movies.



The Movie Wizard is a website that recommends movies based on user preferences and the average rating of movies. The homepage features the best-rated movies from various genres such as drama, horror, comedy, etc. The unique "Magic Recommendations" section takes into account the movies that users have rated, specifically the ones they've rated with five stars (Wich I assume as 'favorite movies'), to generate personalized recommendations. This feature ensures that users are recommended movies they are likely to enjoy based on their own tastes, without suggesting movies they've already seen.

This project solves a common problem for movie enthusiasts and their friends: finding personalized movie recommendations. Often, the movies one person loves may not be appealing to others. This website addresses this issue by tailoring recommendations to individual users' preferences, thus avoiding the scenario where I reccomend a three hours long movie about elves, orcs and magical rings.

The site is designed for anyone who loves movies and seeks personalized recommendations. Its simple UI ensures that users of all experience levels can easily navigate the site and find great movie suggestions.

For building this site, I used mainly Python, HTML, and CSS. I've also got a lot of help from bootstrap 5.3.3, the grid system and the bootstrap classes make the development of the visual of the site really fast. I also wrote some JavaScript code, especially for the dynamic elements of the site like the star rating system (which I am not proud of taking almost three days to make it work properly). Unlike Python, which is a language I have some experience with (learned through various courses, but mainly through CS50P, in which I feel I have almost mastered it), JavaScript was completely new to me. Every significant step was accomplished with the help of the Duck Debugger.

The main framework for this project was Flask, which was taught in the course. Flask was an obvious choice for the site since it was the only framework I knew. The libraries I used include:

    CS50 SQL: I used this library to import SQL, as it is much easier to use than the official SQL library.
    Flask-Session: I used this to import Session for managing user sessions on the site.
    Flask Modules: From the Flask library, I used many modules, such as:
        flash to show messages to users on the screen,
        redirect to redirect users to other pages,
        render_template to display the HTML page with the data sent to the route.
    Werkzeug Security: I used this mainly to manage the login, register, and change password routes, as I only stored hashed passwords in the database.
    Helpers (helpers.py): This file contains many functions, some heavily inspired by the CS50 Finance exercise, such as the error message function. It also includes functions to make API calls to get similar movies to the movie ID sent to the function, and the fetch_movies function to call TMDB to get movies by genre, vote count, etc.
    Flask-JSONify: I used this to convert Python dictionaries to JSON to send to the HTML page for rendering data.
    Random: I used sample from the random module to get five random movies from the best 30 in case the user is not logged in and accesses the magic recommendations route.

For helping me correct syntax mistakes, break tasks into smaller steps, and give me ideas of what to do, I used ChatGPT and, of course, the g.o.a.t Duck Debugger. The IDE I used was CS50 Codespaces, which was very convenient since I built this project on three different computers. It was an easy way to edit the code on multiple machines and have all the changes stored in the cloud.

To run my project as a user, the only thing need is to have a browser, internet connection and go to the link of the website.

The best features of this site include adding movies to a watchlist, rating movies from 1 to 5 stars, searching for movies, and viewing detailed information about each movie (including the year of release, director, synopsis, and title).

In the background, the site identifies users' favorite movies to recommend similar ones that match their tastes. It also suggests movies from directors whose films the user has enjoyed. On the main page, it recommends movies by genre based on their average ratings.

### here are some key parts of the of my code:

#### This is how i recommend movies based on the users personal taste:

```python
@app.route("/magic")
def magic():
    """Generate personalized movie recommendations for the user"""
    # List of bad movies that have good rating
    watched_movies = [19404, 696374, 255709, 724089, 761053, 611291, 553512, 40096, 4935, 12477]

    if is_logged_in():
        # Get the user's favorite movies
        favorite_movies = db.execute("SELECT movie_id FROM ratings WHERE user_id = ? AND rating > 90", session["user_id"])

        if not favorite_movies:
            flash("You need to rate some movies with 5 stars to get recommendations.")
            return redirect("/")

        # Get the user's rated movies to add them to watched movies
        rated_movies = db.execute("SELECT movie_id FROM ratings WHERE user_id = ?", session["user_id"])
        if rated_movies is not None:
            for movie in rated_movies:
                watched_movies.append(int(movie["movie_id"]))

        # Create a list for recommended movies
        recommended_movies = []

        # Get recommendations for each favorite movie
        for movie in favorite_movies:
            recommendations = similar(API_KEY, movie["movie_id"])
            if recommendations:
                recommended_movies.extend(recommendations)

        # Filter out movies the user has already watched
        recommended_movies = [movie for movie in recommended_movies if movie['id'] not in watched_movies]

        # Count occurrences of each recommended movie
        movie_counts = count_movie_appearances(recommended_movies)

        # Sort by count and get the top 5
        sorted_movie_counts = sorted(movie_counts.items(), key=lambda item: item[1], reverse=True)
        five_best = sorted_movie_counts[:5]
        five_best_ids = [movie_id for movie_id, count in five_best]

        # Query to get movie details for the top 5 recommendations
        query = f'SELECT id, poster_url, title FROM movies WHERE id IN ({", ".join(map(str, five_best_ids))})'
        magic = db.execute(query)

        # Get top-rated movies by directors of the user's favorite movies
        favorite_movie_ids = [int(movie["movie_id"]) for movie in favorite_movies]
        favorite_movie_ids_str = ', '.join(map(str, favorite_movie_ids))
        liked_directors = db.execute(f"SELECT DISTINCT director FROM movies WHERE id IN ({favorite_movie_ids_str})")
        directors_and_movies = []

        for director in liked_directors:
            if director["director"] != "Hayao Miyazaki":
                movies = db.execute("""SELECT id, rating, poster_url FROM movies WHERE director = ?
                                    AND id NOT IN (SELECT movie_id FROM ratings WHERE user_id = ?)
                                    ORDER BY rating DESC LIMIT 5""", director["director"], session["user_id"])
                avg_rating = mean([movie['rating'] for movie in movies])
                directors_and_movies.append({
                    'director': director["director"],
                    'movies': movies,
                    'avg_rating': avg_rating
                })

        directors_and_movies = sorted(directors_and_movies, key=lambda x: x['avg_rating'], reverse=True)[:5]

        return render_template("magic.html", magic=magic, directors=directors_and_movies)

```

#### And this is was one of my biggest struggles in this project, not the star rating but JavaScript:

```javascript

    # Variables necessary to keep track of what the user did
    let star_was_clicked = false;
    let star_clicked = 0;

    // Creating the variable star with all stars of the page
    let stars = document.querySelectorAll(".star");
    let userRating = parseInt(document.getElementById("the-movie-id").dataset.userRating) || 0;

    if (userRating) {
        star_was_clicked = true;
        star_clicked = userRating;
        stars.forEach(function(star) {
            let starValue = parseInt(star.getAttribute('data-value'));
            if (starValue <= userRating) {
                star.style.color = '#D400F5';
            }
        });
    }
    let movie_id = parseInt(document.getElementById("the-movie-id").textContent);

    watch_later_btn = document.getElementById("watch-later-btn");
    watch_later_btn.addEventListener("click", function(){
        fetch("add_watch_later", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({movie_id: movie_id})
        })
        .then(response => response.json())
        .then(data =>
        {
            document.getElementById('message').innerText = data.message;
        })
        .catch(error => console.error('Error: ', error));
    });


    // Adding a mouseover event listener to each star
    stars.forEach(function(star)
    {
        // Adding the event listener for the click
        star.addEventListener('click', function()
        {
            // geting the value of the clicked star
            let current_value = parseInt(event.target.getAttribute('data-value'));

            star_was_clicked = true;
            star_clicked = current_value;

            let movie_id = parseInt(document.getElementById("the-movie-id").textContent);

            fetch('rate_movie',
            {
                method: 'POST',
                headers:
                {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({movie_id: movie_id, rating: current_value})
            })
            .then(response => response.json())
            .then(data =>
            {
                document.getElementById('message').innerText = data.message;
            })
            .catch(error => console.error('Error: ', error));




            // looping through each star
            stars.forEach(function(star)
            {
                let star_value = parseInt(star.getAttribute('data-value'));

                if (current_value >= star_value)
                {
                    star.style.color = '#D400F5';
                }
                else
                {
                    star.style.color = '';
                }
            });
        });


        star.addEventListener('mouseover', function(event)
        {
            // Get the value of the current star
            let currentValue = parseInt(event.target.getAttribute('data-value'));

            // Loop through each star and compare values
            stars.forEach(function(star)
            {
                // Get the value of the star being checked
                let starValue = parseInt(star.getAttribute('data-value'));

                // Change the color if the star's value is less than the current star's value
                if (starValue <= currentValue)
                {
                    star.style.color = '#D400F5';
                }
                else
                {
                    // Reset the color if it's not
                    star.style.color = '#444';
                }
            });
        });

        star.addEventListener('mouseout', function(event)
        {
            if (star_was_clicked == false)
            {
                stars.forEach(function(star)
                {
                    star.style.color = '#444';
                });
            }
            else
            {
                stars.forEach(function(star)
                {
                    let other_stars = parseInt(star.getAttribute('data-value'));

                    if (star_clicked >= other_stars)
                    {
                        star.style.color = '#D400F5';
                    }
                    else
                    {
                        star.style.color = '#444';
                    }
                });
            }
        });
    });

```

### The process of building - And the design choices!

#### To talk about the challenges I faced and my design choices, I have to take a step-by-step approach to the things I did in order to complete this site.

The first thing I did was send a prompt to the Duck Debugger asking what I needed to build this site and the steps required to do so. I saved this as a to-do list to always keep track of what I should do next.

The second step was building the login form. This was quite simple since in the CS50x finance exercise, one of the tasks was to build a registration method. This helped me a lot in building this on my site. Then, I built the HTML for the registration and login pages. I put more attention to the login page by adding a movie frame on the side of the login form to make it more visually appealing.

In the first versions of the site, I had a search form on the index page. Over time, I decided to move it to the navbar. This change allowed users to search for movies from anywhere on the site. The idea behind the search was simple: add an event listener and send the request to the search route to get results. However, I realized that the process of searching for movies was really slow. Looking at the terminal of the Flask run command, I saw that the problem was that I was making an API call for every letter the user typed. This had to change, so I asked ChatGPT what a senior developer would do to solve this problem. The best suggestion was quite curious: it suggested that I add a delay before sending the request to the server. The delay should be similar to the time a user takes to type a second letter after pressing the first one. This way, if the user is still typing, the delay will keep resetting until the user stops typing. This worked flawlessly, and I'm really happy with this curious solution.

The next step was to show the details of the movie. This was done by the movie route. Even before I started typing, I knew that I would use a Bootstrap card for this. That was exactly what I did: having the poster on the left and the movie information on the right just felt correct. To make the movie route more visually appealing, I added a div called background, in which I added the movie poster dynamically and set it as the background (with some blur effect that I love) of my movie details page.

Then came the rating system, which was one of the core features I wanted to implement from the beginning. This consisted of five stars that turn purple based on the star you're hovering over. If it was clicked, it sent the value of the star that the user rated to be stored in my database. With the help of Duck Debugger, I came up with the idea of two variables: one to keep track if a star was clicked and one to check if it was clicked. This helped a lot since I wanted to keep the stars purple according to the one clicked. I stored the rating of the user, and if they rated a movie, the server would send the rating to the movie detail page, turning the stars purple accordingly every time the user acces the page.

The process of rating the movie added another feature: the watched movies route. This route shows the movie posters and the stars according to the rating that the user gave. Next for the movie route was the button to add to the watch later list. This is similar to the rating, but instead of rating, it adds the movie to the watch later table. Then I built the HTML for displaying the watch later movies. I used the same CSS  classes and HTML as used in the watched movies but instead of stars, I show the poster and the year of release of the movie.

For the top movies route, I created the function is_logged_in because if the user is logged in, I would remove the watched movies from the recommendations. Then I showed the best-rated movies in the database on the homepage (index.html). This was when I realized that the initial idea of having two tables, one for each database, was a bad idea. I had a lot of bugs and problems related to the database attachment. I also realized that my movie database was bad. I was using the database from the CS50 exercise "movie", which taught about SQL queries. This database didn't have movies from before the 70s. This was a big problem since I intended to recommend masterpieces like Charles Chaplin's films. So, I searched the internet for a good open database and made a lot of API calls to The Movie Database (TMDB) to fill my own database with movie details. I started using users.db for movies and user information, and I managed to create a single table for each function. This was my final format for the database:

```sql
>.schema

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    hash TEXT NOT NULL,
    ratings_json TEXT
);
CREATE TABLE ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 100),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE TABLE watch_later (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    added_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE TABLE movies (
    id INTEGER PRIMARY KEY,
    title TEXT,
    director TEXT,
    year INTEGER,
    rating REAL,
    synopsis TEXT,
    poster_url TEXT
);
```


Initially, I tried to store a JSON file in the users table to keep track of the ratings given by the user, but this bad idea didn’t last long. As soon as I saw the problems with this approach, I decided to create a normal table with simple rows, simplifying the process of checking if the user rated a movie, what the rating was, etc.

At one point, I had two movie databases, but I realized that the problem was related to movies with sensitive content. For example, one of the missing movies was Stanley Kubrick's legendary "A Clockwork Orange." My idea was to make one more try and make API calls to add movies. In the query, I changed the request to the TMDB API to include adult movies. This was one of the worst mistakes I made while building this site. This request added more than ten thousand porn movies from different countries. My top movie route would recommend a lot of Japanese porn movies. The result? I deleted the database and built a new one from scratch. This time, I corrected the query, and the movies were all there, including "A Clockwork Orange." In coding, the problems you face become fuel for more learning. This error taught me more about how the TMDB API worked, and now I had the confidence to recommend movies right from their API. This was when I built this function:

```python
#Function to fetch movies from TMDB, according to page, genre, and vote count
def fetch_movies(page, genre, vote_count):
    base_url = 'https://api.themoviedb.org/3/discover/movie'
    params = {
        'api_key': API_KEY,
        'language': 'en-US',
        'sort_by': 'vote_average.desc',   # Sort by vote average in descending order
        'with_genres': genre,             # Filter by movie genre
        'vote_count.gte': vote_count,     # Only include movies with at least X votes
        'page': page                      # Page number to retrieve
    }
    response = requests.get(base_url, params=params)
    if response.status_code != 200:
        return None
    return response.json().get('results', [])


```

With the help of that function, I built the drama, action, horror, etc., routes. The only thing I had to do was adjust the genre and the vote count for each route. One observation is that this function was stored in the helpers.py file. In the course, I was told multiple times that modularity was a good idea, so whenever I had the opportunity to create a function for something I was doing repeatedly, I chose to do so. That was the case with this function. I found myself copying the code for every single genre I wanted to display, then the idea came to mind to create a function to handle this.

Following the same logic, I was always checking if the user was logged in to get their information, so I created my own is_logged_in function. For the HTML and JavaScript, I had personal JS files for each page that needed one. For example, the movie details page (also known as movie route or movie.html) has its own JavaScript, which handles the add to watch later event, the rating system, and the dynamic visuals from the stars system. Similarly, layout.js has the JavaScript to make the search bar work without needing to refresh the page for each search, and index.js fetches movie details from the routes and fills them dynamically in the HTML.

Around the middle of the project, I realized that Firefox has a feature that shows how the page would look on a mobile device. The result was pretty obvious: I had been building the page for PCs from day one. That's when I started to adapt the page to mobile devices. The posters on the mobile version were really big, so I created some CSS classes to refer to the movie posters. This helped a lot. When I wrote the magic route, everything was already according to the CSS classes I had built. One of my controversial design choices was the search bar. I couldn't manage to make it look pretty in any circumstance, so I created the CSS class 'mobile only.' This class allows me to display something only on mobile devices. Although this approach may slow down the site because all the HTML is downloaded every time the page is loaded, it was a necessary compromise for this feature.

I'm no expert in UI and never learned anything about it before the CS50 course. This was another obstacle I had to overcome. I searched for principles and tips from friends. What I learned was that everything needed to be obvious to the user. The choice of a simple UI with very few elements was key. Almost everything can be accessed through the navbar. The magic movies route can be called from the homepage with a big, bright light purple button, drawing attention to one of the site's greatest features. From my personal choice, I used the boostrap class 'rounded' everywhere that I could because I really like a rounded desing, this gave a personal touch to the site. The choice of colors was simple too. Since I had no experience working with colorful sites, I chose a monochromatic one. Every hover effect lights up a purple border around the hovered item. The few times the site's UI had colors were key moments of user interaction.

### Conclusion

Building this movie recommendation site has been an incredible journey filled with both challenges and triumphs. What started as a simple idea evolved into a fully-fledged application, thanks to careful planning, a willingness to learn, and a lot of trial and error.

From setting up a robust login system inspired by CS50x finance exercises to implementing a dynamic search feature that balances user experience with server performance, each step taught me valuable lessons. The journey wasn't without its hiccups—like the unexpected influx of adult movies in my database—but each problem became an opportunity to deepen my understanding and improve the site's functionality.

One of the most satisfying aspects was crafting a visually appealing and user-friendly interface. Leveraging Bootstrap for design and paying special attention to mobile responsiveness ensured that users would have a seamless experience across devices. The simple yet effective color scheme and intuitive navigation make the site both accessible and engaging.

The rating system and the ability to add movies to a watch later list are features I'm particularly proud of. They not only enhance user interaction but also provide a personalized experience by recommending movies based on individual tastes. By integrating the TMDB API, I ensured that users have access to a comprehensive and up-to-date movie database.

Modularity and code organization were key principles throughout the project. Creating reusable functions and maintaining separate JS files for each page streamlined development and future maintenance. The switch to a more efficient database design eliminated bugs and made the system more reliable.

This is not a complete work—I will build and add more to the site with the knowledge I acquired through this project. Future features will include comments with their own ratings to better display useful feedback, recommendations based on one to five movies of the user's choice (ideal for movie nights with friends), and possibly human-curated movie selections for those cases where a director or movie might need a little extra appreciation to make its way into the algorithm. I also plan to implement named playlists linked to user profiles, showcasing liked movies and favorite directors, and adding an option in the movie details page to redirect users to the streaming services where the movie is available. All of these features are on my new to-do list, and I look forward to implementing them because I really loved doing this project.

In conclusion, this project has been a testament to the power of perseverance, learning from mistakes, and continuously seeking improvement. I'm incredibly proud of what I've built and excited about the potential for future enhancements. This site not only showcases my technical skills but also reflects my passion for creating meaningful, user-centric applications. Thank you for taking the time to explore my project—I hope you enjoy using it as much as I enjoyed building it!
