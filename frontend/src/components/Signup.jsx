import { useState } from "react"
import '../styles/Login.css'
import { Link, useNavigate } from "react-router-dom"
import '../styles/Login.css'





const Login = () => {
    const [user,setUser]=useState({name:"",email:"",password:""})
    const [errorMessage,setErrorMessage]=useState("")
    const [successMessage,setSuccessMessage]=useState("")
    const navigate = useNavigate()


    const handleSubmit=async(e)=>{
        e.preventDefault()
        try{
            const response = await fetch('http://localhost:3000/signup', {method:"post",headers:{"Content-Type":"application/json"},body:JSON.stringify(user),credentials: "include",})
            const data = await response.json()

            if(response.status===200 || response.status===201){
                setSuccessMessage(data.message)
                setErrorMessage("")
                setTimeout(() => {
                    navigate('/')
                }, 1000);
            }
            else if(response.status===409){
                setErrorMessage(data.error)
                setSuccessMessage("")

                setTimeout(() => {
                    navigate('/login')
                }, 3000);
            }
            else {
                setErrorMessage(data.error)
                setSuccessMessage("")
            }
        }
        catch(err){
            console.log(err)
        }
        setUser({name:"",email:"",password:""})
        
        
    }
    const handleReset=(e)=>{
        e.preventDefault()
        setUser({name:"",email:"",password:""})
    }

  return (
    <div className="login signup">
        <h1>Signup Page</h1>
        <form>
            {successMessage && <p style={{color:"green"}}>{successMessage}</p>}
            {errorMessage && <p style={{color:"red"}}>{errorMessage}</p>}
        <label htmlFor="name">Name:
                <input type="name" name="name" id="name" value={user.name} onChange={(e)=>{setUser({...user,name:e.target.value})}} required/>
            </label>
            <label htmlFor="email">Email:
                <input type="email" name="email" id="email" value={user.email} onChange={(e)=>{setUser({...user,email:e.target.value})}} required/>
            </label>
            <label htmlFor="password">Password:
                <input type="password" name="password" id="password" value={user.password} onChange={(e)=>{setUser({...user,password:e.target.value})}} required/>
            </label>
            <div className="btn_section">
            <input type="submit" value="Submit" onClick={handleSubmit} id="submit_btn"/>
            <input type="reset" value="Reset" onClick={handleReset} id="reset_btn"/>
            </div>
            <p>If you already have an account <Link to="/login">Login</Link></p>
        </form>

    </div>
  )
}

export default Login