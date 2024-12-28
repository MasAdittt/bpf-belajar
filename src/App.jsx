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
import Stalking from './pages/Stalking.jsx'
import UsersPage from './components/UserPage.jsx'
import PubAdmin from './pages/PubAdmin.jsx'
import FavoriteListings from './pages/Favorite.jsx'
import ListingForm from './pages/Form.jsx'
import ContactForm from './pages/Contat.jsx'
import AnalyticsTracker from './components/Analytic.jsx'
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          
          <Route path='/' element={<Home />}/>
          <Route path='/Coba' element={<Login />}/>
          <Route path='/Daftar' element={<Register />}/>
          <Route path='/Lupa' element={<Lupa />}/>
          <Route path='/Public' element={<PublicListing />} />
          <Route path='/public-listing' element={<PublicListing />} />
          <Route path='/PubTemplate/:id' element={<PublicTemplate />}/>
          <Route path='/pubtemplate/:id' element={<PublicTemplate />} />
          <Route path='/Contact' element={<ContactForm />}/>
          <Route path='/Form' element={<ListingForm />}/>

          {/* Protected Routes - Requires Authentication */}
          <Route path='/Listing' element={
            <PrivateRoute>
              <Listing />
            </PrivateRoute>
          }/>
        
          <Route path='/Template/:id' element={
            <PrivateRoute>
              <ListingTemplate />
            </PrivateRoute>
          }/>
          <Route path='/All' element={
            <PrivateRoute>
              <AllListings />
            </PrivateRoute>
          }/>
          <Route path='/edit-listing/:id' element={
            <PrivateRoute>
              <EditListing />
            </PrivateRoute>
          }/>
          <Route path='/Profil/:id' element={
            <PrivateRoute>
              <Profil />
            </PrivateRoute>
          }/>
          <Route path="/account/security" element={
            <PrivateRoute>
              <Security />
            </PrivateRoute>
          }/>
          <Route path="/personal/:userId" element={
            <PrivateRoute>
              <Personal />
            </PrivateRoute>
          }/>
          <Route path="/baru/:id" element={
            <PrivateRoute>
              <Listingbaru />
            </PrivateRoute>
          }/>
          <Route path="/favorite" element={
            <PrivateRoute>
              <FavoriteListings />
            </PrivateRoute>
          }/>
          <Route path="/Stalking/:userId" element={
            <PrivateRoute>
              <Stalking />
            </PrivateRoute>
          }/>

          {/* Admin Only Routes */}
          <Route path='/admin' element={
            <PrivateRoute adminOnly={true}>
              <Admin />
            </PrivateRoute>
          }/>
          <Route path='/pubadmin/:id' element={
            <PrivateRoute adminOnly={true}>
              <PubAdmin />
            </PrivateRoute>
          }/>
          <Route path="/users" element={
            <PrivateRoute adminOnly={true}>
              <UsersPage />
            </PrivateRoute>
          }/>
        </Routes>
      </Router>
    </AuthProvider>
  )
} 

export default App