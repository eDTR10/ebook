import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import DICT from './../../../assets/DICT-Logo-Final-2-300x153.png'
import { useState } from "react"
// import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import axios from "./../../../plugin/axios"
import Swal from 'sweetalert2'
import { useNavigate } from "react-router-dom"
import BG from './../../../assets/333692154_1234460367427592_6035706741985280716_n.png'
function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [data, setData] = useState({
    email: "",
    password: ""
  })
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  })
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false)
  const [registerErrors, setRegisterErrors] = useState({
    password: "",
    confirmPassword: "",
    email: "",
    firstName: "",
    lastName: ""
  })

  // const carouselSettings = {
  //   dots: true,
  //   infinite: true,
  //   speed: 500,
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   autoplay: true,
  //   autoplaySpeed: 3000,
  //   draggable: true,
  //   swipe: true,
  //   swipeToSlide: true,
  //   touchThreshold: 10,
  //   cssEase: "cubic-bezier(0.87, 0.03, 0.41, 0.9)",
  //   arrows: false,
  //   dotsClass: "slick-dots",
  //   appendDots: (dots: any) => (
  //     <div className=" text-secondary-foreground" style={{ bottom: "25px" }}>
  //       <ul className=" text-white " >{dots}</ul>
  //     </div>
  //   )
  // }

  // Registration handler with validation
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    let errors = { password: "", confirmPassword: "", email: "", firstName: "", lastName: "" }
    let valid = true

    if (registerData.password.length < 6) {
      errors.password = "Password must be at least 6 characters."
      valid = false
    }
    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match."
      valid = false
    }
    if (!registerData.email) {
      errors.email = "Email is required."
      valid = false
    }
    if (!registerData.firstName) {
      errors.firstName = "First name is required."
      valid = false
    }
    if (!registerData.lastName) {
      errors.lastName = "Last name is required."
      valid = false
    }

    setRegisterErrors(errors)
    if (!valid) return

    setIsLoading(true)
    axios.post('users/register/', {
      email: registerData.email,
      password: registerData.password,
      first_name: registerData.firstName,
      last_name: registerData.lastName
    }).then(() => {
      setShowRegister(false)
      setRegisterData({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: ""
      })
      setRegisterErrors({
        password: "",
        confirmPassword: "",
        email: "",
        firstName: "",
        lastName: ""
      })
    }).catch((error) => {
      setRegisterErrors(prev => ({
        ...prev,
        email: error.response?.data?.email?.[0] || prev.email
      }))
      // No Swal.fire here, just set the error
    }).finally(() => setIsLoading(false))
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex h-screen justify-center  bg-black">
        {/* Carousel Section */}
        <div className="w-[100vw] absolute z-0 lg:w-1/2  ">

          <div className="relative h-screen w-full">
            <img src={BG} className="h-screen w-full object-cover opacity-25" alt="" />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to right, rgba(16,16,16,0.7) 0%, rgba(16,16,16,0.3) 60%, rgba(16,16,16,0) 100%)",
                pointerEvents: "none"
              }}
            />
          </div>
          {/* <Slider {...carouselSettings} className="h-screen">
            <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
              <img src={BG} className=" h-full object-cover" alt="" />
            
            </div>
            <div className="!flex h-[80vh] items-center justify-center flex-col gap-4">
              <h2 className="text-3xl font-bold text-primary">Collaborate Seamlessly</h2>
              <p className="text-muted-foreground text-lg">Work together with your team</p>
            </div>
            <div className="!flex h-[80vh] items-center justify-center flex-col gap-4">
              <h2 className="text-3xl font-bold text-primary">Track Progress</h2>
              <p className="text-muted-foreground text-lg">Monitor your project's development</p>
            </div>
          </Slider> */}
        </div>

        {/* Form Section with swipe effect */}
        <div className="relative w-[30vw] md:w-full  border-[4px] rounded-sm border-l-[#3429d6] border-r-[#a10d0d] bg-card border-t-[#3429d6] border-b-[#ecc216] backdrop-blur-sm lg:w-1/2 flex flex-col items-center justify-center left-0 p-8 overflow-hidden min-h-[30vh]  pb-24 pt-14 self-center">
          <div className="w-full max-w-md space-y-6">
            <div className="fixed top-0 right-0 p-4">
              <ModeToggle />
            </div>

            <div className=" flex relative h-[430px]">
              {/* Login Form */}

              <div
                className={`absolute top-0 left-0 w-full transition-transform duration-500 ${showRegister ? '-translate-x-full duration-500 opacity-0' : ' duration-500 opacity-500  translate-x-100'}`}
              >
                <div className="space-y-2 ">

                  <h1 className="text-3xl font-bold text-primary ">Welcome to eBooking</h1>
                  <p className=" text-xs text-muted-foreground">
                    eBooking is the official booking system for DICT Region 10 facilities. Easily reserve rooms, equipment, and resources for your events and meetings.
                  </p>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  setIsLoading(true)
                  const timeoutId = setTimeout(() => {
                    setIsLoading(false)
                    Swal.fire({
                      icon: 'error',
                      title: 'Request Timeout',
                      text: 'The server is taking too long to respond. Please try again.',
                    })
                  }, 5000)
                  axios.post('token/login/', data).then((e) => {
                    const token = e.data.auth_token;
                    localStorage.setItem('Token', token);
                    axios.get('users/me/', {
                      headers: {
                        Authorization: `Token ${token}`,
                      },
                    }).then((response) => {
                      setIsLoading(false)
                      setData({ email: "", password: "" })
                      localStorage.setItem('accessLevel', response.data.acc_lvl);
                      Swal.fire({
                        icon: 'success',
                        title: 'Login Successful!',
                        text: `Welcome back! ${response.data.first_name}`,
                        showConfirmButton: false,
                        timer: 1500,
                      })
                      navigate('/ebook/admin')
                    })
                  }).catch((error) => {
                    Swal.fire({
                      icon: 'error',
                      title: 'Login Failed',
                      text: error.response?.data?.non_field_errors?.[0] || 'Invalid credentials. Please try again.',
                      timer: 1500,
                      showConfirmButton: false,
                    })
                  })
                    .finally(() => {
                      clearTimeout(timeoutId)
                      setIsLoading(false)
                    })
                }} className="space-y-4">
                  <div className=" mt-5 space-y-2">
                    <Label htmlFor="email" className=" text-secondary-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      className=" text-secondary-foreground"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className=" text-secondary-foreground">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        value={data.password}
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        className=" text-secondary-foreground"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm pt-1 mt-5 hover:underline text-primary cursor-pointer">
                    Forgot password?
                  </p>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
                <div className="text-center mt-5 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setShowRegister(true)}
                    >
                      Create account
                    </button>
                  </p>
                </div>
                <img src={DICT} className="  mt-5 w-full  flex  self-center h-20 object-contain" alt="" />
              </div>
              {/* Registration Form */}
              <div
                className={`absolute  top-[-50px] left-0 w-full transition-transform duration-500 ${showRegister ? 'translate-x-100 opacity-100' : 'translate-x-full opacity-0'}`}
              >
                <div className="space-y-2 ">
                  <h1 className="text-3xl font-bold text-primary">Create Account</h1>
                  <p className="text-muted-foreground">Fill in your details to register</p>
                </div>
                <form onSubmit={handleRegister} className=" flex flex-col gap-4">
                  <div className=" flex gap-5 mt-10"><div className="space-y-2">
                    <Label htmlFor="firstName" className=" text-secondary-foreground">First Name</Label>
                    <Input
                      id="firstName"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      className={`text-secondary-foreground ${registerErrors.firstName ? 'border-red-500' : ''}`}
                      placeholder="First Name"
                      required
                    />
                    {registerErrors.firstName && <p className="text-xs text-red-500">{registerErrors.firstName}</p>}
                  </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className=" text-secondary-foreground">Last Name</Label>
                      <Input
                        id="lastName"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        className={`text-secondary-foreground ${registerErrors.lastName ? 'border-red-500' : ''}`}
                        placeholder="Last Name"
                        required
                      />
                      {registerErrors.lastName && <p className="text-xs text-red-500">{registerErrors.lastName}</p>}
                    </div></div>

                  <div className="space-y-2">
                    <Label htmlFor="registerEmail" className=" text-secondary-foreground">Email</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className={`text-secondary-foreground ${registerErrors.email ? 'border-red-500' : ''}`}
                      placeholder="name@example.com"
                      required
                    />
                    {registerErrors.email && <p className="text-xs text-red-500">{registerErrors.email}</p>}
                  </div>

                  <div className=" flex gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="registerPassword" className=" text-secondary-foreground">Password</Label>
                      <div className="relative">
                        <Input
                          id="registerPassword"
                          type={showRegisterPassword ? "text" : "password"}
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          className={`text-secondary-foreground pr-10 ${registerErrors.password ? 'border-red-500' : ''}`}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          tabIndex={-1}
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {registerErrors.password && <p className="text-xs text-red-500">{registerErrors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className=" text-secondary-foreground">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showRegisterConfirm ? "text" : "password"}
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          className={`text-secondary-foreground pr-10 ${registerErrors.confirmPassword ? 'border-red-500' : ''}`}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          tabIndex={-1}
                        >
                          {showRegisterConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {registerErrors.confirmPassword && <p className="text-xs text-red-500">{registerErrors.confirmPassword}</p>}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Registering...
                      </>
                    ) : (
                      'Register'
                    )}
                  </Button>
                </form>
                <div className="text-center space-y-2 mt-5">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setShowRegister(false)}
                    >
                      Login
                    </button>
                  </p>
                </div>

                <img src={DICT} className="  mt-5 w-full  flex  self-center h-20 object-contain" alt="" />
              </div>
            </div>


          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default Login