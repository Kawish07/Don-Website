import React from "react";
import { Link } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      title: "Prompt and Professional Service",
      preview:
        "Conception Pena was very prompt in returning my calls and scheduling a viewing. He also answered all my questions to my satisfaction.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Top split hero: left image, right content */}
      <section className="grid md:grid-cols-2">
        <div
          className="h-[90vh] md:h-[100vh] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/8815917/pexels-photo-8815917.jpeg')",
          }}
        />
        <div className="flex items-center justify-center p-12">
          <div className="max-w-xl">
            <p className="text-sm tracking-[0.3em] mb-6 text-gray-700 font-light">
              TESTIMONIALS
            </p>
            <h1 className="text-4xl md:text-5xl font-serif mb-6">
              Testimonials
            </h1>
            <p className="text-base text-gray-700 leading-relaxed mb-8">
              Read what our clients have to say about working with Concepcion
              Pena.
            </p>
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("openContactModal"))
              }
              className="border border-black px-6 py-3 text-sm hover:bg-black hover:text-white transition-colors"
            >
              Contact Concepcion
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-0 border-t border-gray-300">
            {testimonials.map((t, index) => (
              <div
                key={t.id}
                className={`p-12 border-b border-gray-300 ${
                  index % 2 === 0 ? "md:border-r" : ""
                }`}
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-full border border-gray-400 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2
                      className="text-3xl font-serif mb-3 leading-tight"
                      style={{
                        fontFamily: "CompassSerif, Times New Roman, serif",
                      }}
                    >
                      {t.title}
                    </h2>
                  </div>
                </div>
                <p
                  className="text-[15px] leading-relaxed mb-4 pl-20"
                  style={{ fontFamily: "CompassSans, Arial, sans-serif" }}
                >
                  {t.preview}
                </p>
                {t.full && (
                  <p
                    className="text-[15px] leading-relaxed mb-4 pl-20"
                    style={{ fontFamily: "CompassSans, Arial, sans-serif" }}
                  >
                    {t.full}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image CTA section with overlay */}
      <section className="relative h-[60vh] md:h-[70vh] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHx8MA%3D%3D')",
          }}
        />
        {/* dark overlay to improve white text contrast */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h2 className="text-white text-4xl md:text-5xl font-serif mb-4">
            Work with Concepcion Pena
          </h2>
          <p className="text-white text-lg mb-6 font-light">
            Call us today to schedule a private showing
          </p>
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("openContactModal"))
            }
            className="border border-white text-white px-6 py-3 hover:bg-white hover:text-gray-900 transition-colors"
          >
            Contact
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
