import { useNavigate } from "react-router-dom";
import styles from "./landing-page.module.css"

function LandingPage() {
    const navigate = useNavigate();

    return (
      <section 
        className={`hero w-full pb-10 flex flex-col items-center gap-8 ${styles.landingPage}`}
        style={{
          backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
          backgroundSize: '30px 30px',
          backgroundColor: 'transparent'
        }}
      >
        <div className="animi w-full mt-10 flex justify-center">
            <span className="block w-[110px] aspect-square bg-[#88B337] rounded-xl"></span>
            <span className="block w-[110px] aspect-square bg-[#F183BC] rounded-xl"></span> 
            <span className="block w-[110px] aspect-square bg-[#000AC2] rounded-xl"></span>
        </div>
        <div className="w-full max-w-[60rem] text-center flex flex-col items-center gap-4">
          <h1 className="w-full text-4xl md:text-7xl  font-bold">
            See where every naira goes and take control.
          </h1>
          <p className="max-w-[84%] text-sm md:text-xl text-[#78778B]">
            Track your spending, understand your habbits, and build smarter
            financial decisions - all in one place.
          </p>
        </div>
        <button 
          className="bg-[var(--budgeet-primary)] text-white text-xl font-semibold p-2 px-4 rounded-2xl cursor-pointer"
          // onClick={() => navigate("/auth", { state: { screen: "signup" } })}
          onClick={() => navigate("/auth/signup")}
        >
          Join for Free
        </button>
      </section>
    );
}

export default LandingPage;
