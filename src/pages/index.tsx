import React from "react";
import Navbar from "@/components/Navbar";

const Index = () => {
  const steps = [
    {
      icon: "/ProductRegistration.svg",
      title: "Product Registration",
      description:
        "The manufacturer registers the product on the blockchain with details like batch number, manufacturing date, and recipient information, ensuring trustless verification.",
    },
    {
      icon: "/SmartContracts.svg",
      title: "Smart Contracts",
      description:
        "Smart contracts enforce rules, deadlines, bonuses, and penalties, automating supply chain operations without manual intervention.",
    },
    {
      icon: "/OwnershipTransfer.svg",
      title: "Ownership Transfer to Distributor",
      description:
        "Ownership is transferred on the blockchain when goods are handed to the distributor, ensuring an immutable record of the transaction.",
    },
    {
      icon: "/Delivery.svg",
      title: "Delivery to Customer",
      description:
        "Once the distributor delivers the product to the customer, ownership is transferred to the consumer on the blockchain.",
    },
    {
      icon: "/Payment.svg",
      title: "Payment Automation",
      description:
        "Smart contracts automate payment calculation based on delivery deadlines, offering bonuses for early delivery or deductions for delays.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

     {/* Hero Section */}
      <main className="relative w-full min-h-screen flex flex-col justify-center items-center">
        {/* Hero Content */}
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-fuchsia-500 via-blue-500 to-cyan-400 text-transparent bg-clip-text">
              Supply Chain Management
            </span>
            <span className="block text-white mt-2">On Blockchain</span>
          </h1>

          <p className="text-gray-300 text-2xl mb-10 max-w-2xl mx-auto">
            Our platform leverages blockchain technology for decentralized,
            tamper-proof supply chain records and trustless, automated payments
            to distributors.
          </p>

          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 rounded-full bg-gradient-to-r from-fuchsia-600 to-blue-500 hover:from-fuchsia-500 hover:to-blue-400 transition-all font-medium">
              Learn How It Works
            </button>
            <button className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 transition-all font-medium">
              Connect Wallet
            </button>
          </div>
        </div>

        {/* Wave SVG Positioned Below Content */}
        <div className="absolute bottom-0 w-full z-5">
          <img src="/wave.svg" alt="Wave Design" className="w-full h-auto" />
        </div>
      </main>

      {/* How It Works Section */}
      <section className="py-20 bg-black relative">
        <div className="container mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-fuchsia-500 to-blue-500 text-transparent bg-clip-text">
              How it works
            </span>
          </h2>
          <p className="text-2xl font-bold text-center mb-12">
            <span className="text-gray-200 bg-clip-text">
            Our platform integrates blockchain technology to digitize and streamline the entire supply chain
            process, promoting transparency, trustlessness, and efficiency. It mirrors real-world supply chain
            operations, ensuring every step—product registration, transfer, verification, and payment—is
            securely recorded and automated.
            </span>
          </p>
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-fuchsia-500 to-blue-500"></div>
            <div className="space-y-12 pl-16">
              {steps.map((step, index) => (
                <div key={index} className="relative flex items-start gap-6">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-full"
                    style={{
                      backgroundColor: "#111111",
                    }}
                  >
                    <img src={step.icon} alt={`${step.title} Icon`} className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      <span className="bg-gradient-to-r from-fuchsia-500 to-blue-500 text-transparent bg-clip-text">
                        {step.title}
                      </span>
                    </h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
