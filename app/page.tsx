'use client'
import { signIn, signOut, useSession } from "next-auth/react"

function Home() {

  const { data: session } = useSession()
  console.log(session)
  if ( session && session.user) {
    return(
      <div className="text-center">
        <p>{ session.user.email } {session.user.firstName}</p>
        <button onClick={()=>signOut()}>
          Sign Out
        </button>
      </div>
    )
  }
  
  return (
  <div className="text-center">
    <button onClick={()=>signIn()}>Sign In</button>
  </div>
  
  )
}

export default Home




