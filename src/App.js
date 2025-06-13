import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) => arr.reduce((acc, cur) => acc + cur, 0) / arr.length;
const KEY = "a68a37d6";

export default function App() {
  const [watched, setWatched] = useLocalStorageState([], "watched");
  const [watchList, setWatchList] = useLocalStorageState([], "watchList");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [movies, isLoading, error] = useMovies(query);

  function onCloseMovie() {
    setSelectedId(null);
  }

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleAddWatched(movie) {
    setWatched((watched) => {
      if (watched.some((m) => m.imdbID === movie.imdbID)) {
        return watched;
      }
      return [...watched, movie];
    });
  }

  function handleAddWatchList(movie) {
    setWatchList((watchList) => {
      if (watchList.some((m) => m.imdbID === movie.imdbID)) {
        return watchList;
      }
      return [...watchList, movie];
    });
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  function handleDeleteWatchList(id) {
    setWatchList((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          <WatchList
            watchList={watchList}
            handleDeleteWatchList={handleDeleteWatchList}
          />
        </Box>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList
              movies={movies}
              handleSelectMovie={handleSelectMovie}
              selectedId={selectedId}
            />
          )}
          {error && <ErrorMsg message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              watched={watched}
              selectedId={selectedId}
              onCloseMovie={onCloseMovie}
              onAddWatched={handleAddWatched}
              onAddWatchlist={handleAddWatchList}
              handleDeleteWatchList={handleDeleteWatchList}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                handleDelete={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Loader() {
  return (
    <div className="container">
      <div className="slice"></div>
      <div className="slice"></div>
      <div className="slice"></div>
      <div className="slice"></div>
      <div className="slice"></div>
      <div className="slice"></div>
    </div>
  );
}

function ErrorMsg({ message }) {
  return <p className="error">{message}</p>;
}
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img" aria-label="popcorn">
        📺
      </span>
      <h1>MovieMate</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function WatchList({ watchList, handleDeleteWatchList }) {
  return (
    <>
      <p className="text1">Want To Watch:</p>
      <section className="watchList-summary">
        {watchList.length > 0 ? watchList.length : "No"} movie
        {watchList.length !== 1 ? "s" : ""} left to watch...
      </section>

      <ul className="list">
        {watchList.map((movie) => (
          <WatchlistMovie
            movie={movie}
            key={movie.imdbID}
            handleDelete={handleDeleteWatchList}
          />
        ))}
      </ul>
    </>
  );
}

function MovieList({ movies, handleSelectMovie }) {
  return (
    <ul className="list list-movies">
      <p className="text1">Search Results</p>
      {movies.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectMovie={handleSelectMovie}
        />
      ))}
    </ul>
  );
}

function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatched,
  watched,
  onAddWatchlist,
  handleDeleteWatchList,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  let isWatched = watched.some((m) => m.imdbID === selectedId);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    if (!isWatched) {
      const newWatchedMovie = {
        imdbID: selectedId,
        poster,
        title,
        year,
        imdbRating: Number(imdbRating),
        runtime: Number(runtime.split(" ").at(0)),
        userRating,
      };

      onAddWatched(newWatchedMovie);
      handleDeleteWatchList(newWatchedMovie.imdbID);
    }
    onCloseMovie();
  }

  function handleWatchList() {
    if (!isWatched) {
      const newWantToWatchMovie = {
        imdbID: selectedId,
        poster,
        title,
        year,
        imdbRating: Number(imdbRating),
        runtime: Number(runtime.split(" ").at(0)),
        userRating,
      };

      onAddWatchlist(newWantToWatchMovie);
    }
  }

  function handleWatched() {
    isWatched = false;
  }

  useKey("Escape", onCloseMovie);

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `${title}`;

      return function () {
        document.title = "MovieMate";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              X
            </button>
            <img src={poster} alt={`${movie} poster`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>⭐{imdbRating} IMDb maxRating</p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched && <p>Your Rating: </p>}
              {isWatched ? (
                <p>You have watched this movie</p>
              ) : (
                <StarRating onSetRating={setUserRating} rating={userRating} />
              )}
              <button
                className="btn-add"
                onClick={!isWatched ? handleAdd : handleWatched}
              >
                {isWatched ? "Watched" : "Add to Watched ✔️"}
              </button>
              {!isWatched && (
                <button className="btn-add" onClick={handleWatchList}>
                  Want to Watch 👁️‍🗨️
                </button>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring: {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Movie({ movie, handleSelectMovie }) {
  return (
    <li onClick={() => handleSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating =
    watched.length > 0 ? average(watched.map((movie) => movie.imdbRating)) : 0;
  const avgUserRating =
    watched.length > 0 ? average(watched.map((movie) => movie.userRating)) : 0;
  const avgRuntime =
    watched.length > 0 ? average(watched.map((movie) => movie.runtime)) : 0;
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, handleDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          handleDelete={handleDelete}
        />
      ))}
    </ul>
  );
}

function WatchlistMovie({ movie, handleDelete }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
      <button className="btn-delete" onClick={() => handleDelete(movie.imdbID)}>
        ✖️
      </button>
    </li>
  );
}

function WatchedMovie({ movie, key, handleDelete }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
      <button className="btn-delete" onClick={() => handleDelete(movie.imdbID)}>
        ✖️
      </button>
    </li>
  );
}
