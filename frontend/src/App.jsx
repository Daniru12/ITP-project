import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './Pages/Home/home'
import LoginPage from './Pages/Login/login'
import { Toaster } from 'react-hot-toast'
import AdminDashboard from './Pages/Admin/adminDashboard'
import RegisterPage from './Pages/Register/register'
import NavBar from './Components/NavBar'
import Profile from './Pages/PetOwner/profile'
import ProviderProfile from './Pages/Providers/providerProfile'
import UserManagement from './Pages/Admin/UserManagement'
import ServiceManagement from './Pages/Admin/ServiceManagement'
import PetsManagement from './Pages/Admin/PetsManagement'
import AddGrooming from './Pages/Providers/addGrooming'
import AddService from './Pages/Providers/addService'
import RegisterPet from './Pages/PetOwner/registerPet'
import CreateFaq from './Pages/FAQ/faq'
import PetBookPage from './Pages/PetOwner/PetBookPage'
import AdvertisingManagement from './Pages/Admin/advertiseManagement'

import PaymentPage from './Pages/Payment/PaymentPage'
import ServiceSummary from './Pages/Payment/AppointmentSummary'
import PaymentForm from './Pages/Payment/PaymentForm'
import AppointmentSummary from './Pages/Payment/OrderSummary'

import AddAdvertisementForm from './Pages/Providers/AddAdvertisementForm'
import AdReviewComponent from './Pages/Providers/AdReviewComponent'
import UpdateAdvertisementForm from './Pages/Advertisement/UpdateAdvertisementForm'


import UpdateUser from './Pages/Admin/UpdateUser'
import AdminUpdatePet from './Pages/Admin/UpdatePet'
import AdminUpdateService from './Pages/Admin/UpdateService'

import { PetCareBooking } from './Pages/Booking/Create/PetCareBooking'

import ProductDetail from './Pages/productMarket/ProductDetail'
import PetMarketplace from './Pages/productMarket/PetMarketplace' 
import CreateProduct from './Pages/productMarket/CreateProduct'
import UpdateProduct from './Pages/productMarket/UpdateProduct'
import DeleteProduct from './Pages/productMarket/deleteProducts'
import ProductManagement from './Pages/productMarket/ProductManagement'

import AppointmentsList from './Pages/Appoiment/appoiments'
import UpdateAppointment from './Pages/Appoiment/UpdateAppointment'
import AppointmentCreate from './Pages/Appoiment/AppointmentCreate'
import UserAppointments from './Pages/Appoiment/UserAppointments'
import CreateReview from './Pages/Review/review'
import AverageRating from './Components/AverageRatings'
import FaqList from './Pages/FAQ/faqCategory'
import FaqAdmin from './Pages/FAQ/FaqAnswers'
import FaqAdminTable from './Pages/FAQ/AdminfaqCategory'
import AllReviews from './Pages/Review/reviewdisplay'
import ServiceReviews from './Components/ServiceReviews';
import DisplayServices from './Pages/Home/displayServices'
import ServiceOverview from './Pages/Home/serviceOverview'
import AddBoarding from './Pages/Providers/addBoarding'
import AddTraining from './Pages/Providers/addTraining'
import UpdateSchedule from "./Pages/Schedule/PetGrromingScheduling/UpdateSchedule"
import UpdatePet from './Pages/PetOwner/updatePet'
import UpdateService from './Pages/Providers/updateService'
import CreateBoedingScheduleForm from './Pages/Schedule/bordingschedule/CreateScheduleForm'
import BoardingScheduleList from './Pages/Schedule/bordingschedule/ScheduleList';
import UpdateBoedingScheduleForm from './Pages/Schedule/bordingschedule/UpdateBoedingScheduleForm'
import CreateGroomingScheduleForm from './Pages/Schedule/PetGrromingScheduling/CreateGroomingScheduleForm'
import GroomingScheduleList from "./Pages/Schedule/PetGrromingScheduling/GroomingScheduleList";
import TrainingScheduleView from './Pages/Schedule/TrainingSchedule/showSchedule'
import CreateTrainingSchedule from './Pages/Schedule/TrainingSchedule/createSchedule'
import FaqManager from './Pages/FAQ/faqall'
import VeiwOwnerOerders from './Pages/Orders/viewOwnerOrders'

import PaymentReviewPage from './Pages/Payment/payemntreview'
import EditProfile from './Pages/Providers/EditProfile'
import EditProfilePetOwner from './Pages/PetOwner/EditProfile'
import GeminiChatApp from './Components/GeminiAPI'
import { ShoppingCart } from './Components/ShoppingCart';
import CartPage from './Pages/productMarket/CartPage'
import OrderConfirmPage from './Pages/productMarket/OrderConfirmPage'
import OrdersPage from './Pages/productMarket/OrdersPage'
import ProviderOrderManagement from './Pages/Orders/ProviderOrderManagement'

// Wrapper component to handle NavBar conditional rendering
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/'; 
  return (
    <GoogleOAuthProvider clientId="758186960483-nfdtc5n6je1spmkfvu3764emq9qmo41q.apps.googleusercontent.com">
      <Toaster position="bottom-right" />
      {!isAdminRoute && <NavBar />}
      <div className={`${!isAdminRoute ? 'pt-15' : ''}`}>
        <Routes>
          <Route path='/' element={<Home />} />
          
          <Route path='/login' element={<LoginPage />} />

          {/* Admin Dashboard with nested routes */}
          <Route path='/admin' element={<AdminDashboard />}>
            <Route path="users" element={<UserManagement />} />
            <Route path="users/update/:id" element={<UpdateUser />} />
            <Route path="services/update/:id" element={<AdminUpdateService />} />
            <Route path="pets/update/:id" element={<AdminUpdatePet />} />
            <Route path="Services" element={<ServiceManagement />} />
            <Route path="AllPets" element={<PetsManagement />} />
            <Route path="AdvertisingManagement" element={<AdvertisingManagement />} />
          </Route>

          <Route path='/register' element={<RegisterPage />} />
          <Route path='/booking' element={<PetCareBooking />} />
          
          <Route path='/AppointmentLIST' element={<AppointmentsList />} />
          <Route path='/Appointmentadd/:id' element={<AppointmentCreate />} />
          <Route path='/Appointment' element={<UserAppointments />} />
          <Route path="/appointments/update/:id" element={<UpdateAppointment />} />
          <Route path="/Trainingscheduleadd" element={<CreateTrainingSchedule />} />
          <Route path="/schedule/training" element={<TrainingScheduleView />} />
          <Route path="/Groomingscheduleadd" element={<CreateGroomingScheduleForm />} />
          <Route path="/update-groomingschedule/:id" element={<UpdateSchedule />} />
          <Route path="/schedule/grooming" element={<GroomingScheduleList />} />
          <Route path="/Bordingscheduleadd" element={<CreateBoedingScheduleForm />} />
          <Route path="/schedule/boarding" element={<BoardingScheduleList />} />
          <Route path="/scheduling/boarding/:id" element={<UpdateBoedingScheduleForm />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/provider-profile' element={<ProviderProfile />} />
          <Route path='/edit-profile' element={<EditProfile />} />
          <Route path='/edit-profile-petowner' element={<EditProfilePetOwner />} />
          <Route path='/add-grooming' element={<AddGrooming />} />
          <Route path='/add-boarding' element={<AddBoarding />} />
          <Route path='/add-training' element={<AddTraining />} />
          <Route path='/add-service' element={<AddService />} />
          <Route path='/register-pet' element={<RegisterPet />} />
          <Route path='/Faq' element={<CreateFaq />} />  
          <Route path='/FaqAll' element={<FaqManager />} /> 
          <Route path='/PaymentPage' element={<PaymentPage />} />
          <Route path='/ServiceSummary' element={<ServiceSummary/>}/>

          <Route path='/payment/:id' element={<PaymentForm/>}/>
          <Route path='/payments' element={< PaymentReviewPage/>}/>
         
          <Route path='/AppointmentSummary' element={<AppointmentSummary/>}/>

          <Route path='/AddAdvertisementForm' element={<AddAdvertisementForm/>}/>
          <Route path='/AdReviewComponent' element={<AdReviewComponent/>}/>
          <Route path='/update-ad/:id' element={<UpdateAdvertisementForm/>}/>
        

          <Route path='/petmarketplace' element={<PetMarketplace />} /> 
          <Route path='/create-product' element={<CreateProduct />} />
          <Route path='/update-product/:id' element={<UpdateProduct />} />
          <Route path='/delete-product' element={<DeleteProduct />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/product-management" element={<ProductManagement />} />
          <Route path="/provider/order-management" element={<ProviderOrderManagement />} />

          <Route path='/display-services' element={<DisplayServices />} />
          <Route path='/service-overview/:id' element={<ServiceOverview />} />

          <Route path='/reviews/:serviceId' element={<CreateReview />} /> 

          <Route path='/edit-pet/:id' element={<UpdatePet />} />
          <Route path='/update-service/:id' element={<UpdateService />} />
          <Route path='/faqList' element={<FaqList />} />
          <Route path='/faqAdmin' element={<FaqAdmin/>}/> 
          <Route path='/reviewdisplay' element={<AllReviews/>}/>
          <Route path="/services/:serviceId/reviews" element={<ServiceReviews />} />
          <Route path="/average/:serviceId" element={<AverageRating />} />
          <Route path='/adminList' element={<FaqAdminTable/>}/>
          <Route path='/ownerOrders' element={<VeiwOwnerOerders/>}/>
          <Route path="/cart" element={<CartPage />} />

          <Route path='/petbook/:petId' element={<PetBookPage />} />
          <Route path="/order-confirm" element={<OrderConfirmPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/my-orders" element={<OrdersPage />} />
          <Route path="/provider/orders" element={<OrdersPage />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
        </Routes>
        {isHomePage && <GeminiChatApp />}
      </div>
    </GoogleOAuthProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;