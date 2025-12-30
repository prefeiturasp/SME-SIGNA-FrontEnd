import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import QuadroBranco from "@/components/dashboard/QuadroBranco/QuadroBranco";

export default function Dashboard() {
    return (
        <div className="pt-4">
            <PageHeader
                title="Dashboard"
                showBackButton={false}
            />
            {/* <QuadroBranco>
            </QuadroBranco>
            */}
        </div>
    );
}
