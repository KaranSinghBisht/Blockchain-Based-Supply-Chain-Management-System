import Navbar from "@/components/Navbar";
import RegisterForm from "@/components/RegisterForm";

const RegisterPage = () => {
  return (
    <div>
      <Navbar />
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="p-8 bg-white rounded shadow-md w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Register New Product</h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
