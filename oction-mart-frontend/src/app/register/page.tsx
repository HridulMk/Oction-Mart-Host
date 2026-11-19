'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Form data interfaces
interface FormData {
  username: string;// Added username field
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  dateOfBirth: string;
  address: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  // Seller specific
  companyName: string;
  businessType: string;
  bankAccount: string;
  taxId: string;
  // Auctioneer specific
  business_name: string;
  contactNumber: string;
  business_category: string;
  licenseNumber: string;
  licenseIssueDate: string;
  licenseDocument: File | null;
}

interface ValidationErrors {
  [key: string]: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

// Memoized InputField component to prevent unnecessary re-renders
const InputField = memo(({ 
  name, 
  placeholder, 
  type = 'text', 
  required = true, 
  error = '', 
  value = '', 
  onChange 
}: {
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <input
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '12px 15px',
        borderRadius: '8px',
        border: `1px solid ${error ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.3)'}`,
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    />
    {error && (
      <div style={{ 
        color: '#ff6b6b', 
        fontSize: '12px', 
        marginTop: '5px',
        marginLeft: '5px'
      }}>
        {error}
      </div>
    )}
  </div>
));

InputField.displayName = 'InputField';

// Memoized PasswordStrengthIndicator component
const PasswordStrengthIndicator = memo(({ passwordStrength }: { passwordStrength: PasswordStrength }) => (
  <div style={{ marginTop: '5px' }}>
    <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
      {[1, 2, 3, 4, 5].map((level) => (
        <div
          key={level}
          style={{
            width: '20px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: level <= passwordStrength.score ? passwordStrength.color : 'rgba(255,255,255,0.3)',
            transition: 'background-color 0.3s ease'
          }}
        />
      ))}
    </div>
    {passwordStrength.feedback.length > 0 && (
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
        {passwordStrength.feedback.join(', ')}
      </div>
    )}
  </div>
));

PasswordStrengthIndicator.displayName = 'PasswordStrengthIndicator';

export default function RegisterPage() {
  const [activeRole, setActiveRole] = useState('buyer');
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    dateOfBirth: '',
    address: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    companyName: '',
    businessType: '',
    bankAccount: '',
    taxId: '',
    business_name: '',
    contactNumber: '',
    business_category: '',
    licenseNumber: '',
    licenseIssueDate: '',
    licenseDocument: null,
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'red'
  });

  useEffect(() => {
    setIsMounted(true);
    const urlRole = searchParams.get('role');
    if (urlRole && ['buyer', 'seller', 'auctioneer'].includes(urlRole)) {
      setActiveRole(urlRole);
    }
  }, []);

  // Password strength calculation - memoized with useCallback
  const calculatePasswordStrength = useCallback((password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;
    
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }
    
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one uppercase letter');
    }
    
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one lowercase letter');
    }
    
    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one number');
    }
    
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one special character');
    }
    
    let color = 'red';
    if (score >= 4) color = 'green';
    else if (score >= 3) color = 'yellow';
    else if (score >= 2) color = 'orange';
    
    return { score, feedback, color };
  }, []);

  // Real-time password strength update
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    }
  }, [formData.password, calculatePasswordStrength]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Common validations
    // if (!formData.username) {
    //   newErrors.username = 'Username is required';
    // } else if (formData.username.length < 3) {
    //   newErrors.username = 'Username must be at least 3 characters';
    // } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
    //   newErrors.username = 'Username can only contain letters, numbers, and underscores';
    // }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Role-specific validations
    if (activeRole === 'buyer') {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.address) newErrors.address = 'Address is required';
    }
    
    if (activeRole === 'seller') {
      if (!formData.companyName) newErrors.companyName = 'Company name is required';
      if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
      if (!formData.businessType) newErrors.businessType = 'Business type is required';
      if (!formData.bankAccount) newErrors.bankAccount = 'Bank account is required';
    }
    
    if (activeRole === 'auctioneer') {
      if (!formData.business_name) newErrors.business_name = 'Full name is required';
      if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
      if (!formData.business_category) newErrors.business_category = 'Business category is required';

      if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
      if (!formData.licenseIssueDate) newErrors.licenseIssueDate = 'License issue date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Use useCallback to memoize the handleInputChange function
  const handleInputChange = useCallback((field: keyof FormData, value: string | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    // Clear form data and errors when switching roles
    setFormData({
      // username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      
      dateOfBirth: '',
      address: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      companyName: '',
      businessType: '',
      bankAccount: '',
      taxId: '',
      business_name: '',
      contactNumber: '',
      business_category: '',
      licenseNumber: '',
      licenseIssueDate: '',
      licenseDocument: null,
    });
    setErrors({});
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      background-color: ${type === 'success' ? '#38a169' : '#e53e3e'};
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Please fix the errors in the form', 'error');
      return;
    }
    
    setIsSubmitting(true);

    
    
    try {
      // Prepare user data for registration
      const userData: any = {
        user_type: activeRole,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        
      };

      // Add role-specific fields with snake_case names
      if (activeRole === 'buyer') {
        userData.firstName = formData.firstName;
        userData.lastName = formData.lastName;
        userData.contactNumber = formData.contactNumber;
        userData.dateOfBirth = formData.dateOfBirth;
        userData.streetAddress = formData.streetAddress;
        userData.address = formData.address;
        userData.city = formData.city;
        userData.state = formData.state;
        userData.zipCode = formData.zipCode;
        
        
        // userData.preferred_categories = '';
        // userData.budget_range = '';
      }

      if (activeRole === 'seller') {
        userData.companyName = formData.companyName;
        userData.contactNumber = formData.contactNumber;
        userData.address = formData.address;
        userData.streetAddress = formData.streetAddress;
        
        userData.city = formData.city;
        userData.state = formData.state;
        userData.zipCode = formData.zipCode;
        
        userData.businessType = formData.businessType;
        userData.bankAccount = formData.bankAccount;
        userData.taxId = formData.taxId;
      }

      if (activeRole === 'auctioneer') {
        userData.business_name = formData.business_name;
        userData.contactNumber = formData.contactNumber;
        userData.address = formData.address;
        userData.streetAddress = formData.streetAddress;
        userData.city = formData.city;
        userData.state = formData.state;
        userData.zipCode = formData.zipCode;
        userData.business_category = formData.business_category;
        
        
        userData.bankAccount = formData.bankAccount;
        userData.licenseNumber = formData.licenseNumber;
        userData.licenseIssueDate = formData.licenseIssueDate;
        userData.licenseDocument = formData.licenseDocument;
      }
      
      console.log('User Data to be sent:', userData);
      // Use auth service for registration
      const { authService } = await import('@/api/services/auth');
      await authService.register(userData);
      
      showNotification(`${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} registration successful!`, 'success');
      
      // Redirect to appropriate dashboard after successful registration
      setTimeout(() => {
        if (activeRole === 'buyer') window.location.href = '/buyer-login-app';
        else if (activeRole === 'seller') window.location.href = '/buyer-login-app';
        else if (activeRole === 'auctioneer') window.location.href = '/buyer-login-app';
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3D Carousel logic and handlers for roles
  const roles = ['buyer', 'seller', 'auctioneer'];
  const getCardPosition = (role: string) => {
    const idx = roles.indexOf(role);
    const activeIdx = roles.indexOf(activeRole);
    if (idx === activeIdx) return 'center';
    if ((idx + 1) % 3 === activeIdx) return 'left';
    if ((idx + 2) % 3 === activeIdx) return 'right';
    return '';
  };

  // Touch swipe handlers for carousel
  useEffect(() => {
    let startX = 0;
    let endX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    const handleTouchMove = (e: TouchEvent) => {
      endX = e.touches[0].clientX;
    };
    const handleTouchEnd = () => {
      if (startX - endX > 50) {
        // Swipe left
        const idx = roles.indexOf(activeRole);
        handleRoleChange(roles[(idx + 1) % 3]);
      } else if (endX - startX > 50) {
        // Swipe right
        const idx = roles.indexOf(activeRole);
        handleRoleChange(roles[(idx + 2) % 3]);
      }
    };
    const container = document.getElementById('register-carousel-container');
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchmove', handleTouchMove);
      container.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [activeRole]);

  // Keyboard navigation (left/right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = roles.indexOf(activeRole);
      if (e.key === 'ArrowLeft') {
        handleRoleChange(roles[(idx + 2) % 3]);
      } else if (e.key === 'ArrowRight') {
        handleRoleChange(roles[(idx + 1) % 3]);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeRole]);

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, 
        ${activeRole === 'buyer' ? '#1a1a2e, #16213e' : 
          activeRole === 'seller' ? '#1a2e1a, #162e16' : 
          '#2e1a1a, #3e1616'})`,
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Animated Background Elements - only render on client to avoid hydration mismatch */}
      {isMounted && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: Math.random() * 5 + 's'
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0px',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto'
      }}>
        {/* 3D Carousel Cards Container */}
        <div
          id="register-carousel-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            width: '100%',
            height: '420px',
            minHeight: '320px',
            marginBottom: '0px',
            perspective: '1200px',
            userSelect: 'none',
          }}
        >
          {roles.map((role) => {
            const pos = getCardPosition(role);
            let transform = '';
            let zIndex = 1;
            let opacity = 0.5;
            let pointer = 'pointer';
            if (pos === 'center') {
              transform = 'translateX(0) scale(1.1) rotateY(0deg)';
              zIndex = 10;
              opacity = 1;
              pointer = 'default';
            } else if (pos === 'left') {
              transform = 'translateX(-60%) scale(0.9) rotateY(30deg)';
              zIndex = 5;
            } else if (pos === 'right') {
              transform = 'translateX(60%) scale(0.9) rotateY(-30deg)';
              zIndex = 5;
            }
            // Card content for each role
            let icon = '🛒', title = 'BUYER', desc = 'Join as a buyer to bid on unique items and discover amazing deals';
            if (role === 'seller') {
              icon = '🏪';
              title = 'SELLER';
              desc = 'Start selling your items and reach a global audience of buyers';
            } else if (role === 'auctioneer') {
              icon = '🎭';
              title = 'AUCTIONEER';
              desc = 'Conduct professional auctions and manage bidding processes';
            }
            return (
              <div
                key={role}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  width: 350,
                  minWidth: 260,
                  maxWidth: '90vw',
                  background: 'rgba(255,255,255,0.10)',
                  borderRadius: 25,
                  border: pos === 'center' ? '3px solid rgba(255,255,255,0.4)' : '2px solid transparent',
                  boxShadow: pos === 'center' ? '0 20px 40px rgba(0,0,0,0.3)' : '0 10px 20px rgba(0,0,0,0.2)',
                  filter: pos === 'center' ? 'none' : 'blur(3px)',
                  zIndex,
                  opacity,
                  cursor: pointer,
                  transform: `translate(-50%, 0) ${transform}`,
                  transition: 'transform 0.7s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s',
                  pointerEvents: pos === 'center' ? 'auto' : 'auto',
                  padding: 40,
                  overflow: 'hidden',
                  textAlign: 'center',
                }}
                onClick={() => pos !== 'center' && handleRoleChange(role)}
              >
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>{icon}</div>
                <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>{title}</h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', lineHeight: '1.5' }}>{desc}</p>
              </div>
            );
          })}
        </div>
        {/* Indicator Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          {roles.map((role) => (
            <div
              key={role}
              onClick={() => handleRoleChange(role)}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: activeRole === role ? 'white' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                transform: activeRole === role ? 'scale(1.3)' : 'scale(1)',
                boxShadow: activeRole === role ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
              }}
            />
          ))}
        </div>
        {/* Registration Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          borderRadius: '25px',
          padding: '50px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          width: '100%',
          maxWidth: '800px',
          animation: activeRole ? 'slideUp 0.6s ease-out' : 'none',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '30px',
            textTransform: 'uppercase'
          }}>
            {activeRole.toUpperCase()} Registration
          </h2>

          <form onSubmit={handleSubmit}>


{/* Buyer Form Fields */}
            {activeRole === 'buyer' && (
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Account Information */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Account Information
                  </label>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {/* <InputField
                      name="username"
                      placeholder="Username"
                      required
                      error={errors.username}
                      value={formData.username}
                      onChange={(value) => handleInputChange('username', value)}
                    /> */}
                    <InputField
                      name="email"
                      placeholder="Email Address"
                      required
                      type="email"
                      error={errors.email}
                      value={formData.email}
                      onChange={(value) => handleInputChange('email', value)}
                    />
                    <InputField
                      name="password"
                      placeholder="Password"
                      required
                      type="password"
                      error={errors.password}
                      value={formData.password}
                      onChange={(value) => handleInputChange('password', value)}
                    />
                    <PasswordStrengthIndicator passwordStrength={passwordStrength} />
                    <InputField
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      required
                      type="password"
                      error={errors.confirmPassword}
                      value={formData.confirmPassword}
                      onChange={(value) => handleInputChange('confirmPassword', value)}
                    />
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Personal Information
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <InputField
                      name="firstName"
                      placeholder="First Name"
                      required
                      error={errors.firstName}
                      value={formData.firstName}
                      onChange={(value) => handleInputChange('firstName', value)}
                    />
                    <InputField
                      name="lastName"
                      placeholder="Last Name"
                      required
                      error={errors.lastName}
                      value={formData.lastName}
                      onChange={(value) => handleInputChange('lastName', value)}
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Date of Birth
                  </label>
                  <InputField
                    name="dateOfBirth"
                    placeholder="Date of Birth"
                    required
                    type="date"
                    error={errors.dateOfBirth}
                    value={formData.dateOfBirth}
                    onChange={(value) => handleInputChange('dateOfBirth', value)}
                  />
                </div>

                {/* Contact Information */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Contact Information
                  </label>
                  <InputField
                    name="contactNumber"
                    placeholder="Phone Number"
                    required
                    type="string"
                    error={errors.contactNumber}
                    value={formData.contactNumber}
                    onChange={(value) => handleInputChange('contactNumber', value)}
                  />
                </div>

                {/* Address Information */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Address Information
                  </label>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <InputField
                      name="address"
                      placeholder="Residence Address"
                      required
                      error={errors.address}
                      value={formData.address}
                      onChange={(value) => handleInputChange('address', value)}
                    />
                    <InputField
                      name="streetAddress"
                      placeholder="Street Address"
                      required
                      error={errors.streetAddress}
                      value={formData.streetAddress}
                      onChange={(value) => handleInputChange('streetAddress', value)}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                      <InputField
                        name="city"
                        placeholder="City"
                        required
                        error={errors.city}
                        value={formData.city}
                        onChange={(value) => handleInputChange('city', value)}
                      />
                      <InputField
                        name="state"
                        placeholder="State/Province"
                        required
                        error={errors.state}
                        value={formData.state}
                        onChange={(value) => handleInputChange('state', value)}
                      />
                      <InputField
                        name="zipCode"
                        placeholder="Zip Code"
                        required
                        error={errors.zipCode}
                        value={formData.zipCode}
                        onChange={(value) => handleInputChange('zipCode', value)}
                      />
                    </div>
                  </div>
                </div>

                
              </div>
            )}


{/* Seller Form Fields */}
            {activeRole === 'seller' && (
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Account Information */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Account Information
                  </label>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {/* <InputField
                      name="username"
                      placeholder="Username"
                      required
                      error={errors.username}
                      value={formData.username}
                      onChange={(value) => handleInputChange('username', value)}
                    /> */}
                    <InputField
                      name="email"
                      placeholder="Email Address"
                      required
                      type="email"
                      error={errors.email}
                      value={formData.email}
                      onChange={(value) => handleInputChange('email', value)}
                    />
                    <InputField
                      name="password"
                      placeholder="Password"
                      required
                      type="password"
                      error={errors.password}
                      value={formData.password}
                      onChange={(value) => handleInputChange('password', value)}
                    />
                    <PasswordStrengthIndicator passwordStrength={passwordStrength} />
                    <InputField
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      required
                      type="password"
                      error={errors.confirmPassword}
                      value={formData.confirmPassword}
                      onChange={(value) => handleInputChange('confirmPassword', value)}
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Contact Number
                  </label>
                  <InputField
                    name="contactNumber"
                    placeholder="eg. +91 1234567"
                    required
                    type="tel"
                    error={errors.contactNumber}
                    value={formData.contactNumber}
                    onChange={(value) => handleInputChange('contactNumber', value)}
                  />
                </div>

                {/* Business Information */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Business Information
                  </label>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <InputField
                      name="companyName"
                      placeholder="Company Name"
                      required
                      error={errors.companyName}
                      value={formData.companyName}
                      onChange={(value) => handleInputChange('companyName', value)}
                    />
                    <div>
                      <select
                        required
                        value={formData.businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                        style={{
                          padding: '12px 15px',
                          borderRadius: '8px',
                          border: `1px solid ${errors.businessType ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.3)'}`,
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontSize: '14px',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Select Business Type</option>
                        <option value="retail">Retail</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="realestate">Real Estate</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="service">Service</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.businessType && (
                        <div style={{ 
                          color: '#ff6b6b', 
                          fontSize: '12px', 
                          marginTop: '5px',
                          marginLeft: '5px'
                        }}>
                          {errors.businessType}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Financial Information
                  </label>
                  <InputField
                    name="bankAccount"
                    placeholder="Bank Account Number"
                    required
                    type="text"
                    error={errors.bankAccount}
                    value={formData.bankAccount}
                    onChange={(value) => handleInputChange('bankAccount', value)}
                  />
                  
                  <InputField
                    name="taxId"
                    placeholder="Tax id number"
                    
                    type="text"
                    error={errors.taxId}
                    value={formData.taxId}
                    onChange={(value) => handleInputChange('taxId', value)}
                  />
                </div>

                {/* Business Address */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Business Address
                  </label>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <InputField
                      name="address"
                      placeholder="Residence Address"
                      required
                      error={errors.address}
                      value={formData.address}
                      onChange={(value) => handleInputChange('address', value)}
                    />
                    <InputField
                      name="streetAddress"
                      placeholder="Street Address"
                      required
                      error={errors.streetAddress}
                      value={formData.streetAddress}
                      onChange={(value) => handleInputChange('streetAddress', value)}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                      <InputField
                        name="city"
                        placeholder="City"
                        required
                        error={errors.city}
                        value={formData.city}
                        onChange={(value) => handleInputChange('city', value)}
                      />
                      <InputField
                        name="state"
                        placeholder="State/Province"
                        required
                        error={errors.state}
                        value={formData.state}
                        onChange={(value) => handleInputChange('state', value)}
                      />
                      <InputField
                        name="zipCode"
                        placeholder="Zip Code"
                        required
                        error={errors.zipCode}
                        value={formData.zipCode}
                        onChange={(value) => handleInputChange('zipCode', value)}
                      />
                    </div>
                  </div>
                </div>

                
              </div>
            )}



{/* Auctioneer-specific fields */}
            {activeRole === 'auctioneer' && (
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Account Information */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Account Information
                  </label>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {/* <InputField
                      name="username"
                      placeholder="Username"
                      required
                      error={errors.username}
                      value={formData.username}
                      onChange={(value) => handleInputChange('username', value)}
                    /> */}
                    <InputField
                      name="email"
                      placeholder="Email Address"
                      required
                      type="email"
                      error={errors.email}
                      value={formData.email}
                      onChange={(value) => handleInputChange('email', value)}
                    />
                    <InputField
                      name="password"
                      placeholder="Password"
                      required
                      type="password"
                      error={errors.password}
                      value={formData.password}
                      onChange={(value) => handleInputChange('password', value)}
                    />
                    <PasswordStrengthIndicator passwordStrength={passwordStrength} />
                    <InputField
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      required
                      type="password"
                      error={errors.confirmPassword}
                      value={formData.confirmPassword}
                      onChange={(value) => handleInputChange('confirmPassword', value)}
                    />
                  </div>
                </div>

                {/* Full Name/Business Name */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Full Name/Business Name
                  </label>
                  <InputField
                    name="business_name"
                    placeholder="Full Name/Business Name"
                    required
                    error={errors.business_name}
                    value={formData.business_name}
                    onChange={(value) => handleInputChange('business_name', value)}
                  />
                </div>
                

                {/* Contact Number */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Contact Number
                  </label>
                  <InputField
                    name="contactNumber"
                    placeholder="eg. +91 1234567"
                    required
                    type="tel"
                    error={errors.contactNumber}
                    value={formData.contactNumber}
                    onChange={(value) => handleInputChange('contactNumber', value)}
                  />
                </div>

                {/* Bank Account Number */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Bank Account number
                  </label>
                  <InputField
                    name="bankAccount"
                    placeholder="eg. HH HHHHHHH"
                    required
                    type="text"
                    error={errors.bankAccount}
                    value={formData.bankAccount}
                    onChange={(value) => handleInputChange('bankAccount', value)}
                  />
                </div>

                {/* Business Address */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Business Address
                  </label>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <InputField
                      name="streetAddress"
                      placeholder="Street Address"
                      required
                      error={errors.streetAddress}
                      value={formData.streetAddress}
                      onChange={(value) => handleInputChange('streetAddress', value)}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                      <InputField
                        name="city"
                        placeholder="City"
                        required
                        error={errors.city}
                        value={formData.city}
                        onChange={(value) => handleInputChange('city', value)}
                      />
                      <InputField
                        name="state"
                        placeholder="State/Province"
                        required
                        error={errors.state}
                        value={formData.state}
                        onChange={(value) => handleInputChange('state', value)}
                      />
                      <InputField
                        name="zipCode"
                        placeholder="Zip Code"
                        required
                        error={errors.zipCode}
                        value={formData.zipCode}
                        onChange={(value) => handleInputChange('zipCode', value)}
                      />
                    </div>
                  </div>
                </div>





                
{/* Business Category */}
<div>
  <label style={{
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
    display: 'block'
  }}>
    Business Category
  </label>
  <select
    name="business_category"
    value={formData.business_category}
    onChange={(e) => handleInputChange("business_category", e.target.value)}
    required
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
    }}
  >
    <option value="">Select a category</option>
    <option value="art">Art & Paintings</option>
    <option value="antiques">Antiques & Collectibles</option>
    <option value="jewelry">Jewelry & Watches</option>
    <option value="furniture">Furniture & Home Décor</option>
    <option value="electronics">Electronics & Gadgets</option>
    <option value="vehicles">Vehicles (Cars, Bikes, etc.)</option>
    <option value="real_estate">Real Estate</option>
    <option value="fashion">Fashion & Accessories</option>
    <option value="books">Books & Manuscripts</option>
    <option value="sports">Sports & Memorabilia</option>
    <option value="coins">Coins & Stamps</option>
    <option value="industrial">Industrial & Machinery</option>
    <option value="other">Other</option>
  </select>
  {errors.business_category && (
    <p style={{ color: "red", fontSize: "12px" }}>{errors.business_category}</p>
  )}
  </div>

               

               
                    

                 

                {/* Auctioneer License Number */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Auctioneer License Number
                  </label>
                  <InputField
                    name="licenseNumber"
                    placeholder="eg. CA-123456"
                    required
                    type="text"
                    error={errors.licenseNumber}
                    value={formData.licenseNumber}
                    onChange={(value) => handleInputChange('licenseNumber', value)}
                  />
                </div>

                {/* License Issue Date */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    License Issue Date
                  </label>
                  <InputField
                    name="licenseIssueDate"
                    placeholder="dd - mm - yyyy"
                    required
                    type="date"
                    error={errors.licenseIssueDate}
                    value={formData.licenseIssueDate}
                    onChange={(value) => handleInputChange('licenseIssueDate', value)}
                  />
                </div>

                {/* Upload License Document */}
                <div>
                  <label style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Upload License Document
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '5px'
                  }}>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleInputChange('licenseDocument', file);
                        }
                      }}
                      style={{
                        color: 'white',
                        fontSize: '14px',
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }}
                    />
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                      {formData.licenseDocument instanceof File ? formData.licenseDocument.name : 'No file chosen'}
                    </span>
                  </div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '11px',
                    marginTop: '5px'
                  }}>
                    Accepted formats: PDF, JPG, PNG (MAX 5MB).
                  </div>
                </div>

                {/* Don't have license link */}
                <div style={{
                  textAlign: 'center',
                  marginTop: '10px'
                }}>
                  <Link href="/get-auctioneer-license" style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontStyle: 'italic'
                  }}>
                    Don't have an auctioneer license?
                  </Link>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '15px',
                background: isSubmitting 
                  ? 'linear-gradient(135deg, #666, #444)' 
                  : 'linear-gradient(135deg, #8A2BE2, #6A1EB2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '20px',
                transition: 'all 0.3s ease',
                opacity: isSubmitting ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(138, 43, 226, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isSubmitting ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Registering...
                </div>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '20px'
          }}>
            <Link href="/buyer-login-app" style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              Already have an account? Login here
            </Link>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 