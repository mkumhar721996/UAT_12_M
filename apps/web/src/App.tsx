import Dashboard from "./dashboard/Dashboard";
import HealthRecordsPlaceholder from "./health-records/HealthRecordsPlaceholder";
import { useHashRoute } from "./routes";
import SignedInLayout from "./SignedInLayout";

function App() {
  const route = useHashRoute();
  return (
    <SignedInLayout current={route}>
      {route === "health-records" ? <HealthRecordsPlaceholder /> : <Dashboard />}
    </SignedInLayout>
  );
}

export default App;
