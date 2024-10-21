import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom' 
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profil from './pages/Profil.jsx'
import Lupa from './pages/Lupa'
import Security from './pages/Security.jsx'
import Listing from './pages/Listing'
import ListingTemplate from './pages/ListingTemplate'
import EditListing from './pages/EditListing.jsx'
import AllListings from './pages/AllListings.jsx'
import PublicListing from './pages/PublicListing.jsx'
import PublicTemplate from './pages/PublicTemplate.jsx'
import Personal from './pages/Personal.jsx'
import Admin from './pages/Admin.jsx'
import { AuthProvider } from './config/Auth.jsx';
import PrivateRoute from './components/PrivateRoute.jsx'
import Listingbaru from './pages/Listingbaru.jsx'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/Coba' element={<Login />}/>
          <Route path='/Daftar' element={<Register />}/>
          <Route path='/Lupa' element={<Lupa />}/>
          <Route path='/Listing' element={<Listing />}/>
          <Route path='/Template/:id' element={<ListingTemplate />}/>
          <Route path='/All' element={<AllListings />}/>
          <Route path="/Public" element={<PublicListing />} />
          {/* Route untuk menangani pencarian */}
          <Route path="/public-listing" element={<PublicListing />} />
          <Route path='/edit-listing/:id' element={<EditListing />}/>
          <Route path='/PubTemplate/:id' element={<PublicTemplate />}/>
          <Route path='/pubtemplate/:id' element={<PublicTemplate />} /> {/* Tambahan route dengan huruf kecil */}
          <Route path='/Profil/:id' element={<Profil />}/>
          <Route path="/account/security" element={<Security />} />  
          <Route path="/personal" element={<Personal />} /> 
          <Route path="/baru/:id" element={<Listingbaru />} />          
          <Route path='/admin' element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }/>
        </Routes>
      </Router>
    </AuthProvider>
  )
} 

export default App