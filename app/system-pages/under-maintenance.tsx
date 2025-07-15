import Logo from "@/components/partials/auth/logo";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import Image from "next/image";
import Link from "next/link";

const UnderMaintenancePage = () => {
  return (
    <div className="min-h-screen">
      <div className="absolute left-0 top-0 w-full">
        <div className="flex flex-wrap justify-between items-center py-6 container">
          <div>
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <div>
            <Button variant="outline" size="sm">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="flex justify-center flex-wrap items-center min-h-screen flex-col text-center">
          <Image height={500} width={500} src="/images/svg/img-2.svg" alt="Under Maintenance" />
          <h4 className="text-3xl font-medium text-default-900 mb-2">
            Sistem Sedang Dalam Pemeliharaan
          </h4>
          <p className="font-normal text-base text-default-500 mb-6">
            Kami sedang melakukan pemeliharaan untuk meningkatkan kualitas sistem. <br />
            Silakan kembali lagi nanti.
          </p>
          <div className="flex items-center gap-4 text-sm text-default-600 mb-4">
            <div className="flex items-center gap-2">
              <Icon icon="heroicons-outline:clock" className="h-4 w-4" />
              <span>Estimasi selesai: 2 jam</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="heroicons-outline:wrench-screwdriver" className="h-4 w-4" />
              <span>Pembaruan sistem</span>
            </div>
          </div>
          <Button variant="outline">
            <Icon icon="heroicons-outline:arrow-path" className="h-4 w-4 mr-2" />
            Refresh Halaman
          </Button>
        </div>
      </div>
      <div className="fixed bottom-0 w-full">
        <div className="container">
          <div className="md:flex justify-between items-center flex-wrap space-y-4 py-6">
            <div>
              <ul className="flex md:justify-start justify-center gap-3">
                <li>
                  <Link
                    href="#"
                    className="border-default inline-block border border-solid rounded-full hover:bg-default hover:text-default-50 duration-300 transition-all p-2"
                  >
                    <Icon className="h-4 w-4" icon="icomoon-free:facebook" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="border-default inline-block border border-solid rounded-full hover:bg-default hover:text-default-50 duration-300 transition-all p-2"
                  >
                    <Icon className="h-4 w-4" icon="icomoon-free:twitter" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="border-default inline-block border border-solid rounded-full hover:bg-default hover:text-default-50 duration-300 transition-all p-2"
                  >
                    <Icon className="h-4 w-4" icon="icomoon-free:linkedin2" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="border-default inline-block border border-solid rounded-full hover:bg-default hover:text-default-50 duration-300 transition-all p-2"
                  >
                    <Icon className="h-4 w-4" icon="icomoon-free:google" />
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <ul className="flex md:justify-start justify-center space-x-3">
                <li>
                  <Link
                    href="#"
                    className="text-default-500 text-sm transition duration-150 hover:text-default-900"
                  >
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-default-500 text-sm transition duration-150 hover:text-default-900"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-default-500 text-sm transition duration-150 hover:text-default-900"
                  >
                    Email us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderMaintenancePage;
