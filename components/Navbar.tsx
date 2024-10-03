import { useRouter } from "next/router";
import { useAuth } from "./context/authContext";

export default function NavBar() {
  const router = useRouter();
  const { authUser, logout, signIn } = useAuth();

  const loginBtn = () => {
    return (
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          signIn().then((user) => {
            if (user != null) {
              router.push("/scrape/list");
            }
          });
        }}
      >
        Sign In
      </button>
    );
  };

  const logoutBtn = () => {
    return (
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          logout().then(() => {
            router.push("/");
          });
        }}
      >
        Sign Out
      </button>
    );
  };

  const authBtn = authUser != null ? logoutBtn() : loginBtn();

  return (
    <nav className="bg-gray-100">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex space-x-4">
          {authUser && (
            <a
              href="/scrape/list"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Back to Home
            </a>
          )}
          <a
            href="/scrape/create"
            className="bg-white hover:bg-gray-100 text-blue-500 font-semibold py-2 px-4 border border-blue-500 rounded"
          >
            + Create New Scrape
          </a>
        </div>
        {authBtn}
      </div>
    </nav>
  );
}
