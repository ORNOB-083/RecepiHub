import SignupForm from "./SignupForm";

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo = params?.redirect || "/dashboard";
  
  return <SignupForm redirectTo={redirectTo} />;
}