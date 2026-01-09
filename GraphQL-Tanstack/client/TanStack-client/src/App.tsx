import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import AddUser from './components/AddUser';
import Users from './components/Users';
import DeleteUser from './components/DeleteUser';
const queryClient = new QueryClient();
function App() {

  

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <h1>GraphQl + Tanstack + TypeScript</h1>
        <AddUser/>
        <div 
        style={{height : 1, backgroundColor : '#ffffff', width : '100%',marginTop : 10, marginBottom : 10}}></div>
        <DeleteUser/>
        <div style={{height : 1, backgroundColor : '#ffffff', width : '100%',marginTop : 10, marginBottom : 10}}></div>
        <Users/>
      </div>
    </QueryClientProvider>
  )
}

export default App
