import FeaturedRecipes from "@/Components/home/FeaturedRecipes";
import Banner from "../Components/home/Banner";
import PopularRecipes from "@/Components/home/PopularRecipes";
import SuccessStories from "@/Components/home/SuccessStories";
import WhyChooseUs from "@/Components/home/WhyChooseUs";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Banner />
      <FeaturedRecipes></FeaturedRecipes>
      <PopularRecipes></PopularRecipes>
      <SuccessStories></SuccessStories>
      <WhyChooseUs></WhyChooseUs>
    </main>
  );
}