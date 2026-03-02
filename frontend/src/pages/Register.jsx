import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { handleApiError } from '../utils/errorHandler';
import { validateEmail, validatePassword, validateUsername, getPasswordStrength } from '../utils/validation';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password does not meet complexity requirements';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      const apiError = handleApiError(err);
      if (apiError.errors) {
        setErrors(apiError.errors);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📖 Library Management</h1>
          <h2 className="text-xl font-semibold text-gray-700">Create Account</h2>
          <p className="text-gray-500 mt-2">Register as a new member</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            placeholder="Choose a username"
            required
          />
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email"
            required
          />
          
          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Choose a password"
              required
            />
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i < passwordStrength.score 
                          ? passwordStrength.strength === 'weak' ? 'bg-red-500'
                          : passwordStrength.strength === 'medium' ? 'bg-yellow-500'
                          : passwordStrength.strength === 'good' ? 'bg-blue-500'
                          : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    {passwordStrength.checks.length ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <X className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={passwordStrength.checks.length ? 'text-green-600' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordStrength.checks.uppercase ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <X className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-500'}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordStrength.checks.lowercase ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <X className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-500'}>
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordStrength.checks.number ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <X className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={passwordStrength.checks.number ? 'text-green-600' : 'text-gray-500'}>
                      One number
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordStrength.checks.special ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <X className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={passwordStrength.checks.special ? 'text-green-600' : 'text-gray-500'}>
                      One special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            required
          />

          <Button
            type="submit"
            variant="success"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
