import { useAuth } from "@/components/context/authContext";
// import { useInterval } from "@/components/hooks/useInterval";
import { listScrapes } from "@/utils/db/handlers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BaseUser, Plan, Scrape } from "@/utils/interfaces";
import ScrapeBlock from "@/components/ScrapeBlock";
import NavBar from "@/components/Navbar";

export default function List() {
  const { authUser, userLoading } = useAuth();
  const router = useRouter();
  const [scrapes, setScrapes] = useState<Scrape[]>([]);

  useEffect(() => {
    fetchScrapes();
  }, [userLoading]);

//   useInterval(() => {
//     fetchScrapes();
//   }, 30000);

  const sortDescending = (list: Scrape[]): Scrape[] => {
    return list.sort((a, b) => {
      if (a.created === null) {
        return -1; // Place nulls at the top
      }
      if (b.created === null) {
        return 1;
      }
      return (b.created || 0) - (a.created || 0); // Sort in descending order
    });
  };

  const fetchScrapes = async () => {
    if (!userLoading && authUser != null) {
      const fetchedScrapes = await listScrapes(authUser);
      setScrapes(sortDescending(fetchedScrapes));
    }
    if (!userLoading && !authUser) {
      router.push("/");
    }
  };

  const createBlock = () => {
    return (
      <button
        onClick={() => {
          router.push("/scrape/create");
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Create New Scrape
      </button>
    );
  };

  if (userLoading || !authUser) {
    return (
      <div className="container mx-auto pt-20 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const topBlock = createBlock()
  const scrapeBlocks = scrapes.map((scrape) => {
    return <ScrapeBlock scrape={scrape} key={scrape.id} />;
  });

  return (
    <>
      <NavBar />
      <div className="flex justify-center w-full px-4">
        <div className="w-full max-w-3xl">
          <div className="mt-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">Scrape Websites</h2>
            <button
              onClick={() => {
                router.push("/scrape/create");
              }}
              className="bg-white hover:bg-gray-100 text-blue-500 font-bold py-2 px-4 rounded border border-blue-500"
            >
              Create New Scrape Job
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Previously Scraped</h2>
            {scrapeBlocks}
          </div>
        </div>
      </div>
    </>
  );
}
