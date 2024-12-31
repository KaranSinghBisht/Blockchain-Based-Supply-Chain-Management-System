import Navbar from "@/components/Navbar";
import RegisterForm from "@/components/RegisterForm";

const RegisterPage = () => {
  return (
    <div>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-black ">
        <div className="p-8 bg-gray-900 rounded shadow-md w-full max-w-3xl">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
