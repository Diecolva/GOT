import { Fragment, useEffect, useState } from 'react';
import '../App.css';
import { v4 as uuidv4 } from 'uuid';


const API_URL = "https://thronesapi.com/api/v2/Characters"

function Personaje({ item, favoritos, setFavoritos, bloqueado, setBloqueado }) {
  const [esFavorito, setEsFavorito] = useState(false);

  useEffect(() => {
    setEsFavorito(favoritos.some((fav) => fav.id === item.id));
  }, [favoritos, item]);


  const cambiaraFav = () => {
    if (esFavorito) {
      const updatedFavoritos = favoritos.filter((fav) => fav.id !== item.id);
      setFavoritos(updatedFavoritos);
      localStorage.setItem('favoritos', JSON.stringify(updatedFavoritos));
    } else {
      const newFavorito = { id: uuidv4(), ...item };
      setFavoritos([...favoritos, newFavorito]);
      localStorage.setItem('favoritos', JSON.stringify([...favoritos, newFavorito]));
    }
    setEsFavorito(!esFavorito);
  };

  const bloquearPersonaje = () => {
    if (bloqueado.some((bloq) => bloq.id === item.id)) {
      const updatedBloqueado = bloqueado.filter((bloq) => bloq.id !== item.id);
      setBloqueado(updatedBloqueado);
      localStorage.setItem('bloqueado', JSON.stringify(updatedBloqueado));
    } else {
      const newBloqueado = { id: uuidv4(), ...item };
      setBloqueado([...bloqueado, newBloqueado]);
      localStorage.setItem('bloqueado', JSON.stringify([...bloqueado, newBloqueado]));
    }
  };

  return (
    <div className='col-xs-12 col-sm-6 col-md-4 col-lg-4'>
      {!bloqueado.some((bloq) => bloq.id === item.id) && (
        <div className={`card got-card ${bloqueado.some((bloq) => bloq.id === item.id) ? 'blocked' : ''}`}>
          <img src={item.imageUrl} className="card-img-top" alt="..." />
          <div className="card-body">
            <h5 className="card-title">{item.family}</h5>
            <div>
              <h3 className="card-subtitle">{item.fullName}</h3>
            </div>
            <hr />
            <i className={`bi bi-heart-fill icon-fav ${esFavorito ? 'favorito' : ''}`} onClick={cambiaraFav}></i>
            <i className="bi bi-x-octagon-fill icon-trash" onClick={bloquearPersonaje} style={{ position: 'absolute', right: 20 }}></i>
          </div>
        </div>
      )}
    </div>
  );
}


function App() {
  const [items, setItems] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [favoritos, setFavoritos] = useState([]);
  const [bloqueado, setBloqueado] = useState([]);
  const [totalElementos, setTotalElementos] = useState(0);
  const [mostrarBloqueados, setMostrarBloqueados] = useState(false);


  useEffect(() => {
    const storedFavoritos = localStorage.getItem('favoritos');
    if (storedFavoritos) {
      setFavoritos(JSON.parse(storedFavoritos));
    }
  }, []);

  useEffect(() => {
    const storedBloqueado = localStorage.getItem('bloqueado');
    if (storedBloqueado) {
      setBloqueado(JSON.parse(storedBloqueado));
    }
  }, []);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result)
          setItems(result)
          setTotalElementos(result.length);
        },
        (error) => {
          console.log("ERROR: ", + error)
        }
      )
  }, [])

  const searchItems = (searchValue) => {
    setSearchInput(searchValue);
    const filteredItems = items.filter((item) =>
      item.fullName.toLowerCase().includes(searchValue.toLowerCase()) && !bloqueado.includes(item.id)
    );
    setTotalElementos(filteredItems.length);
  };

  const eliminarDeFavoritos = (id) => {
    const updatedFavoritos = favoritos.filter((fav) => fav.id !== id);
    setFavoritos(updatedFavoritos);
  };

  const totalFavoritos = favoritos.length;

  const toggleMostrarBloqueados = () => {
    setMostrarBloqueados(!mostrarBloqueados);
  };

  const desbloquearPersonaje = (id) => {
    const updatedBloqueado = bloqueado.filter((bloq) => bloq.id !== id);
    setBloqueado(updatedBloqueado);
    localStorage.setItem('bloqueado', JSON.stringify(updatedBloqueado));
  };

  return (
    <Fragment>
      <h1 className='alert alert-primary titulo'>GAME OF THRONES</h1>

      <div className='input-group alert alert-primary mt-3'>
        <input onChange={(e) => searchItems(e.target.value)} type='search' placeholder='Ingrese un nombre de personaje' className='form-control'></input>
        <button className='btn btn-primary'>BUSCAR</button>
      </div>

      <div className="row">
        <div className="col-xs-12 col-sm-8 col-md-9 col-lg-8">
          <div className="row">
            {items
              .filter((item) =>
                item.fullName.toLowerCase().includes(searchInput.toLowerCase()) && !bloqueado.includes(item.id)
              )
              .map((item) => (
                <Personaje key={item.id} item={item} favoritos={favoritos} setFavoritos={setFavoritos} bloqueado={bloqueado} setBloqueado={setBloqueado} />
              ))}
          </div>
        </div>

        <div className="col-xs-12 col-sm-4 col-md-3 col-lg-4">
          <div className="bg-fav">
            <h3 className="bi bi-heart-fill fav"> Favoritos</h3>
          </div>
          {favoritos.map((fav) => (
            <div key={fav.id}>
              <h5>{fav.family}</h5> <h3>{fav.fullName}</h3>
              <i className="bi bi-x-lg" onClick={() => eliminarDeFavoritos(fav.id)} />
              <hr />
            </div>
          ))}
          <p>Total de elementos: {totalElementos}</p>
          <p>Cantidad de favoritos: {totalFavoritos}</p>
          <p>Cantidad de bloqueados: {bloqueado.length}</p>
          <button className="btn btn-secondary container-fluid" type="button" onClick={toggleMostrarBloqueados}>
            Elementos Bloqueados
          </button>
          {mostrarBloqueados && (
            <div>
              {bloqueado.map((bloq) => (
                <div key={bloq.id}>
                <h5 className='mt-3'>{bloq.family}</h5>
                <div>
                  <h3>{bloq.fullName}</h3>
                </div>
                <i className="bi bi-x-lg" onClick={() => desbloquearPersonaje(bloq.id)} />
                <hr />
              </div>
              ))}
            </div>
          )}
        </div>
        <strong className='footer'>Sitio web desarrollado por: Diego Colón Vásquez</strong>
      </div>
    </Fragment>
  );
}

export default App;