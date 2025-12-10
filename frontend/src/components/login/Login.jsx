import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import loginImage from '../../assets/ChatGPT Image 10 déc. 2025, 19_09_49.png'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ login: '', password: '' })
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const navigate = useNavigate()

  const users = [
    { id: 1, name: "abdelkrim", password: "ab1234$", role: "admin" },
    {id:2, name: "asim", password: "as1234$", role: "admin"},
    {id:2, name: "khadija", password: "kh1234$", role: "employee"},
    {id:2, name: "adil", password: "ad1234$", role: "employee"},
    { id: 4, name: "gerant", password: "gr1234$", role: "confirmation_manager" },
    { id: 5, name: "karim", password: "deli", role: "delivery" },
    { id: 7, name: "mohamed", password: "mo1234$", role: "livreur" },
    { id: 8, name: "souad", password: "so1234$", role: "confirmation_manager" },
  ]

  // Toast function
  const showToast = (message, type) => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' })
    }, 4000)
  }

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' }
    
    let strength = 0
    if (pwd.length >= 4) strength += 25
    if (pwd.length >= 6) strength += 25
    if (/[A-Z]/.test(pwd)) strength += 25
    if (/[0-9]/.test(pwd)) strength += 25
    
    if (strength <= 25) return { level: 25, label: 'Faible', color: 'bg-red-500' }
    if (strength <= 50) return { level: 50, label: 'Moyen', color: 'bg-yellow-500' }
    if (strength <= 75) return { level: 75, label: 'Bon', color: 'bg-blue-500' }
    return { level: 100, label: 'Fort', color: 'bg-emerald-500' }
  }

  // Validation function
  const validateInputs = () => {
    let isValid = true
    const newErrors = { login: '', password: '' }

    if (!login.trim()) {
      newErrors.login = 'Le login est requis'
      isValid = false
    } else if (login.length < 3) {
      newErrors.login = 'Le login doit contenir au moins 3 caractères'
      isValid = false
    }

    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est requis'
      isValid = false
    } else if (password.length < 4) {
      newErrors.password = 'Le mot de passe doit contenir au moins 4 caractères'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleLogin = () => {
    // Clear previous errors
    setErrors({ login: '', password: '' })

    // Validate inputs
    if (!validateInputs()) {
      showToast('Veuillez corriger les erreurs', 'error')
      return
    }

    // Check credentials
    const user = users.find(u => u.name === login && u.password === password)
    
    if (user) {
      // Store user info in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user))
      
      showToast(`Bienvenue ${user.name} !`, 'success')
      
      // Navigate after toast based on role or specific employee name
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin/dashboard')
        } else if (user.role === 'manager') {
          navigate('/manager')
        } else if (user.name === 'khadija') {
          navigate('/employee/confirmation/dashboard')
        } else if (user.name === 'adil') {
          navigate('/employee/packaging/queue')
        } else if (user.role === 'confirmation_manager') {
          navigate('/employee/confirmation-manager/dashboard')
        } else if (user.role === 'confirmation') {
          navigate('/employee/confirmation/dashboard')
        } else if (user.role === 'packaging') {
          navigate('/employee/packaging/queue')
        } else if (user.role === 'delivery' || user.role === 'livreur') {
          navigate('/employee/delivery/dashboard')
        } else if (user.role === 'delivery_manager') {
          navigate('/employee/delivery-manager/dashboard')
        } else {
          navigate('/employee')
        }
      }, 1000)
    } else {
      showToast('Login ou mot de passe incorrect', 'error')
    }
  }

  const handleResetPassword = () => {
    navigate('/forgot_password')
  }

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#f8f9fc] text-slate-900 font-sans overflow-hidden relative">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-sm transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-500/95 text-white' 
            : 'bg-red-500/95 text-white'
        }`}>
          {/* Icon */}
          {toast.type === 'success' ? (
            <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          
          {/* Message */}
          <span className="font-semibold">{toast.message}</span>
          
          {/* Close button */}
          <button 
            onClick={() => setToast({ show: false, message: '', type: '' })}
            className="ml-2 hover:opacity-70 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Left Side: Form Section */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center px-6 lg:px-20 py-10">
        <div className="w-full max-w-md">
          
          {/* Logo */}
          <div className="mb-10 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#1325ec] w-8 h-8">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="5" r="2" opacity="0.2" />
              <circle cx="12" cy="19" r="2" opacity="0.2" />
              <circle cx="5" cy="12" r="2" opacity="0.2" />
              <circle cx="19" cy="12" r="2" opacity="0.2" />
            </svg>
            <span className="text-xl font-bold tracking-wide text-slate-900">Platform</span>
          </div>

          {/* Header */}
          <h1 className="text-3xl font-bold mb-2 text-slate-900">Bienvenue !</h1>
          <p className="text-slate-500 mb-8 text-sm">Connectez-vous pour continuer.</p>

          {/* Form */}
          <div className="flex flex-col gap-5">
            
            {/* Login Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 ml-1">Login</label>
              <div className="relative">
                <input
                  type="text"
                  value={login}
                  onChange={(e) => {
                    setLogin(e.target.value)
                    if (errors.login) setErrors({ ...errors, login: '' })
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Entrez votre login"
                  className={`w-full h-12 rounded-xl bg-white border ${
                    errors.login ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-[#1325ec]/50'
                  } text-slate-900 px-4 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-[#1325ec] transition-all shadow-sm`}
                />
                {errors.login && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs ml-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.login}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 ml-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({ ...errors, password: '' })
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Entrez votre mot de passe"
                  className={`w-full h-12 rounded-xl bg-white border ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-[#1325ec]/50'
                  } text-slate-900 px-4 pr-12 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-[#1325ec] transition-all shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
                
                {/* Password Strength Indicator */}
                {password && !errors.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">Robustesse du mot de passe</span>
                      <span className={`text-xs font-semibold ${
                        getPasswordStrength(password).level === 100 ? 'text-emerald-600' :
                        getPasswordStrength(password).level === 75 ? 'text-blue-600' :
                        getPasswordStrength(password).level === 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {getPasswordStrength(password).label}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getPasswordStrength(password).color}`}
                        style={{ width: `${getPasswordStrength(password).level}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs ml-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="w-full text-right">
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault()
                  handleResetPassword() 
                }} 
                className="text-[#1325ec] text-sm font-bold hover:underline transition-colors"
              >
                Mot de passe oublié ?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full h-12 mt-2 bg-[#1325ec] hover:bg-[#1325ec]/90 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Se connecter
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

          </div>
       
        </div>
      </div>

      {/* Right Side: Image Background */}
      <div className="hidden lg:flex w-1/2 p-4 h-screen">
        <div className="w-full h-full rounded-3xl shadow-2xl overflow-hidden">
          <img 
            src={loginImage} 
            alt="Login illustration" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

    </div>
  )
}