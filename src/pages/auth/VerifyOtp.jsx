import React, { useState, useEffect } from 'react';
import { Logo } from '../../assets';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resendVerification } from '../../features/auth/authSlice';
import { useAuthState } from '../../hooks/useAuthState';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Using the custom hook for safe auth state access
  const { loading, error } = useAuthState();

  const contactInfo = sessionStorage.getItem('contactInfo');
  const verificationMethod = sessionStorage.getItem('verificationMethod');
  const name = sessionStorage.getItem('name');

  useEffect(() => {
    // Redirect to verification method page if no contact info is found
    if (!contactInfo || !verificationMethod) {
      navigate('/auth/verify-method');
      return;
    }

    // Start countdown timer
    const countdownTimer = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [contactInfo, verificationMethod, navigate]);

  // Format the contact info for display
  const formatContact = () => {
    if (verificationMethod === 'email') {
      const [username, domain] = contactInfo.split('@');
      if (username && domain) {
        const maskedUsername =
          username.slice(0, 2) + '*'.repeat(username.length - 2);
        return `${maskedUsername}@${domain}`;
      }
      return contactInfo;
    } else {
      // Phone number
      return (
        contactInfo.slice(0, 3) +
        '*'.repeat(contactInfo.length - 6) +
        contactInfo.slice(-3)
      );
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste event with multiple characters
      const otpArray = value.split('').slice(0, 6);
      const newOtp = [...otp];

      otpArray.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);

      // Focus on the next input if available
      const nextInput = document.getElementById(
        `otp-${index + otpArray.length}`
      );
      if (nextInput) nextInput.focus();
    } else {
      // Handle single character input
      if (!/^[0-9]$/.test(value) && value !== '') return;

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus on next input after entering a digit
      if (value !== '' && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        // If current input is empty and backspace is pressed, focus on previous input
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        document.getElementById(`otp-${index - 1}`).focus();
      } else if (otp[index] !== '') {
        // Clear current input if it has a value
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleResendCode = async () => {
    setIsResendDisabled(true);
    setTimer(60);

    const payload = { name };
    if (verificationMethod === 'email') {
      payload.email = contactInfo;
    } else {
      payload.phoneNumber = contactInfo;
    }

    try {
      await dispatch(resendVerification(payload));

      // Restart the timer
      const countdownTimer = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to resend verification code:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      return;
    }

    // Store OTP in session storage for later use in registration
    sessionStorage.setItem('verificationCode', otpValue);

    // Navigate to registration page
    navigate('/auth/register');
  };

  return (
    <div className='section-container max-w-[550px] mx-auto mt-10 p-10 bg-white rounded-lg shadow-lg'>
      <div className='flex justify-center mb-6'>
        <Link to='/'>
          <img src={Logo} alt='Website Logo' className='h-20 w-20' />
        </Link>
      </div>
      <h2 className='section-heading text-3xl font-bold mb-6 text-center'>
        Verification Code
      </h2>
      <p className='mb-2 text-gray-600 text-center'>
        Enter the verification code sent to:
      </p>
      <p className='mb-8 text-center font-semibold'>{formatContact()}</p>

      <form className='space-y-6' onSubmit={handleSubmit}>
        <div className='flex justify-center space-x-2 sm:space-x-4'>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type='text'
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className='w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
              maxLength={6}
              autoComplete='one-time-code'
            />
          ))}
        </div>

        {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

        <div className='text-center'>
          <p className='text-gray-600 mb-4'>
            Didn't receive the code?{' '}
            <button
              type='button'
              onClick={handleResendCode}
              disabled={isResendDisabled}
              className={`font-semibold ${
                isResendDisabled
                  ? 'text-gray-400'
                  : 'text-blue-500 hover:underline'
              }`}
            >
              {isResendDisabled ? `Resend in ${timer}s` : 'Resend Code'}
            </button>
          </p>
        </div>

        <button
          type='submit'
          className='w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300'
          disabled={otp.join('').length !== 6 || loading}
        >
          {loading ? 'Processing...' : 'Continue'}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;
