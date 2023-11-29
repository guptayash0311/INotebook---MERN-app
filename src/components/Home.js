import NotesComponent from './NotesComponent';

const Home = (props) => {
  const {showAlert} = props
  return (
    <div>
      <NotesComponent showAlert={showAlert}/>
    </div>
  )
}

export default Home
