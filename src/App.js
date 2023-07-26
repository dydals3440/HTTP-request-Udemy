import React, { useState, useEffect, useCallback } from 'react';

import MoviesList from './components/MoviesList';
import AddMovie from './components/AddMovie';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMoviesHandler = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'https://react-http-28b62-default-rtdb.asia-southeast1.firebasedatabase.app/movies.json'
      );
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      const data = await response.json();
      // 아래 Results가 제대로 적용되지 않은 것을 확인할 수 있음.
      // 실제 데이터 통신시 key: value값이 변경되었기 떄문
      // 실제 통신 data console.log(data)시 아래처럼 나옴.
      // {암호화된id: { openingText: "some text" , releaseDate: "2020-06-01", title:"MyFirst movie" }}
      // 변환하는 과정 필요

      const loadedMovies = [];

      for (const key in data) {
        loadedMovies.push({
          id: key,
          title: data[key].title,
          openingText: data[key].openingText,
          releaseDate: data[key].releaseDate,
        });
        // key는 암호화된 데이터를 의미
      }

      const transformedMovies = data.results.map((movieData) => {
        return {
          id: movieData.episode_id,
          title: movieData.title,
          openingText: movieData.opening_crawl,
          releaseDate: movieData.release_date,
        };
      });
      setMovies(transformedMovies);
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchMoviesHandler();
  }, [fetchMoviesHandler]);

  async function addMovieHandler(movie) {
    console.log(movie);
    const response = await fetch(
      'https://react-http-28b62-default-rtdb.asia-southeast1.firebasedatabase.app/movies.json',
      {
        method: 'POST', // default: 'GET'
        // body는 자바스크립트의 객체가 아닌, JSON데이터를 원함.
        // JSON은 프론트 백 간의 데이터 통신에 사용되는 유형
        // 자바스크립트 utility method JSON.stringify 사용하면됨.
        body: JSON.stringify(movie),
        headers: {
          // Firebase에는 헤더 필요없음, 헤더없어도 요청은 정상적으로 처리 대다수의 API들은 이러한 헤더를 필요로함, 이 헤더를 통해 어떤 컨텐츠가 전달되는지 구분하기 때문.
          'Content-Type': 'application/json',
        },
      }
    );
    const data = await response.json();
    console.log(data);
  }

  let content = <p>Found no movies.</p>;

  if (movies.length > 0) {
    content = <MoviesList movies={movies} />;
  }

  if (error) {
    content = <p>{error}</p>;
  }

  if (isLoading) {
    content = <p>Loading...</p>;
  }

  return (
    <React.Fragment>
      <section>
        <AddMovie onAddMovie={addMovieHandler} />
      </section>
      <section>
        <button onClick={fetchMoviesHandler}>Fetch Movies</button>
      </section>
      <section>{content}</section>
    </React.Fragment>
  );
}

export default App;

// 총정리
// 리액트는 백엔드와 통신할 수 있지만, 데이터베이스와의 직접적인 통신은 보안상의 문제 떔에 불가
// 하지만, 백엔드 API를 통한 요청 전송은 가능 대부분은 REST API에 전송
// fetchAPI axios 요청을 전송하는 방법도 배웠다.

// 응답을 받아오고, 필요에 따라 오류 전달 발생시키는 방법, 응답을 통해 받아온 데이터를 다루는 방법
// GET, POST 요청, 다양한 상태 관리법도 배움.
