import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import AddUser from './components/AddUser';
import Users from './components/Users';
const queryClient = new QueryClient();
function App() {

  

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <h1>GraphQl + Tanstack + TypeScript</h1>
        <AddUser/>
        <Users/>
      </div>
    </QueryClientProvider>
  )
}

export default App
