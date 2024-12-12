import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../config/Auth';
import { getDatabase, ref, onValue, set, update, get, query, orderByChild, equalTo } from "firebase/database";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faStar, faMapMarkerAlt, faEnvelope, faPhone, faUpload } from '@fortawesome/free-solid-svg-icons';
import Navbaru from '../components/Navbaru';
import Loading from '../components/Loading';
import Bawah from '../components/Bawah';
import UserReviewsComponent from '../components/UserReview';

function Stalking() {
    const navigate = useNavigate();
    const { userId } = useParams(); // Get userId from URL parameter
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [username, setUsername] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [location, setLocation] = useState('');
    const [reviews, setReviews] = useState([]);
    const [activePage, setActivePage] = useState('My Profile');
    const [coverPhoto, setCoverPhoto] = useState(null);
    const fileInputRef = useRef(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [province, setProvince] = useState('');
    const [backgroundPhoto, setBackgroundPhoto] = useState(null);
    const profileInputRef = useRef(null);
    const [reviewCount, setReviewCount] = useState(0);

            // Modified useEffect to handle the async fetchUserReviewCount
    useEffect(() => {
        if (userId) {
            const db = getDatabase();
            const userRef = ref(db, `users/${userId}`);
            onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setPhone(userData.phone || '');
                    setUsername(userData.username || '');
                    setProfilePhoto(userData.profilePhoto || null);
                    setLocation(userData.location || '');
                    setEmail(userData.email || '');
                    setFirstName(userData.firstName || '');
                    setLastName(userData.lastName || '');
                    setProvince(userData.province || '');
                    setBackgroundPhoto(userData.backgroundPhoto || null);
                }
            });
            
            // Fetch review count
            const getReviewCount = async () => {
                const count = await fetchUserReviewCount(userId);
                setReviewCount(count);
            };
            
            getReviewCount();
        }
    }, [userId]);
            

            const fetchUserReviewCount = async (userId) => {
                try {
                    const db = getDatabase();
                    const listingsRef = ref(db, 'listings');
                    const listingsSnapshot = await get(listingsRef);
                    
                    let totalReviews = 0;
            
                    if (listingsSnapshot.exists()) {
                        const listings = listingsSnapshot.val();
                        for (const listingId in listings) {
                            if (listings[listingId].reviews) {
                                const reviewsRef = ref(db, `listings/${listingId}/reviews`);
                                const userReviewQuery = query(reviewsRef, orderByChild('userId'), equalTo(userId));
                                const userReviewSnapshot = await get(userReviewQuery);
                                if (userReviewSnapshot.exists()) {
                                    totalReviews += Object.keys(userReviewSnapshot.val()).length;
                                }
                            }
                        }
                    }
            
                    return totalReviews;
                } catch (error) {
                    console.error("Error fetching review count:", error);
                    return 0;
                }
            };
            const renderContent = () => {
                switch (activePage) {
                    case 'Edit Profile':
                        return (
                            <div className="pembungkus md:w-[548px] w-full px-4 md:px-0 min-h-[950px] font-['Quicksand'] pb-[20px]">
                                <h2 className="text-2xl font-medium leading-[30px] py-4">Edit Profile</h2>                                       
                        </div>
                    );
                case 'My Profile':
                default:
                    return (
                        <>
    <aside className="bg-white p-6 rounded-lg  w-full md:w-[281px] h-[300px] mb-6 md:mb-0">                           
        <h2 style={{ fontFamily:'Quicksand', fontSize:'20px', fontWeight:700,color:"#3A3A3A", paddingBottom:'16px'}}>About me</h2>
                                <ul className="space-y-2">
                                    <li className="flex items-center">
                                        <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-600"  style={{paddingRight:'5px'}}/>
                                        <span className="truncate" style={{color:'#3A3A3A', fontFamily:'Quicksand', fontWeight:300, fontSize:'14px'}}>@{firstName} {lastName}</span>
                                    </li>
                                    <li className="flex items-center">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-600"  style={{paddingRight:'5px'}}/>
                                        <span className="truncate"  style={{color:'#3A3A3A', fontFamily:'Quicksand', fontWeight:300, fontSize:'14px'}}>{location || 'Not provided'}, {province}</span>
                                    </li>
                                    <li className="flex items-center overflow-hidden">
                                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-600 flex-shrink-0"  style={{paddingRight:'5px'}}/>
                                        <span className="truncate"  style={{color:'#3A3A3A', fontFamily:'Quicksand', fontWeight:300, fontSize:'14px'}}>{email}</span>
                                    </li>
                                    <li className="flex items-center">
                                        <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-600" style={{paddingRight:'5px'}} />
                                        <span className="truncate"  style={{color:'#3A3A3A', fontFamily:'Quicksand', fontWeight:300, fontSize:'14px'}}>{phone || 'Not provided'}</span>
                                    </li>
                                </ul>
                                <h2 className="text-xl font-bold mt-6 mb-2" style={{fontFamily:'Quicksand'}}>Contribution</h2>
                                <li className="flex items-center" style={{fontFamily:'Quicksand'}}>
                                    <FontAwesomeIcon icon={faStar} className="mr-2 text-gray-600" style={{fontFamily:'Quicksand'}}/>
                                    {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                                </li>
                            </aside>
                            <main className="flex-grow">
                                <UserReviewsComponent userId={userId} />
                            </main>
                        </>
                    );
            }
        };

        return (
            <>
                <Navbaru />
                <div className="bg-gray-100 min-h-screen">
                    <div className="w-full h-48 md:h-80 bg-cover bg-center" 
                        style={{backgroundImage: backgroundPhoto ? `url(${backgroundPhoto})` : "url('./src/assets/image/atas.jpg')"}}>
                    </div>
                    <div className="max-w-6xl mx-auto -mt-16 md:-mt-24 mb-8 px-4 md:px-0">
                        <div className="bg-white rounded-lg shadow-md flex flex-col md:flex-row items-center md:items-start p-4 md:p-[45px_45px_23px_45px]">
                            <div className="mb-4 md:mb-0 md:mr-6">
                                {isUploading ? (
                                    <Loading />
                                ) : profilePhoto ? (
                                    <img src={profilePhoto} alt="Profile" className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover" />
                                ) : (
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-quicksand">
                                        <span>{firstName ? firstName[0].toUpperCase() : 'A'}</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-center md:text-left md:pt-5">
                                <h1 className="text-2xl md:text-[35px] text-[#3A3A3A] font-bold font-['Quicksand']">
                                    {firstName} {lastName}
                                </h1>
                                <p className="text-sm md:text-base font-light font-['Quicksand']">{email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-6xl mx-auto px-4 md:px-0">
                    
                        <div className="flex flex-col md:flex-row gap-8 pb-[45px]">
                            {renderContent()}
                        </div>
                    </div>
                </div>
                <Bawah />
            </>
        );
    }

    export default Stalking;