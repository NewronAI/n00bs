import {Fragment, Suspense, useEffect} from 'react';
import {Disclosure, Menu, Transition} from '@headlessui/react';
import {MenuIcon as Bars3Icon, XIcon as XMarkIcon,} from '@heroicons/react/outline';
import clsx from "clsx";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import {useUser} from "@auth0/nextjs-auth0/client";

// import ThemeSelector from "../ThemeSelector";

// const ThemeSelector = dynamic(() => import('@newron/common/components/ThemeSelector'), { ssr: false });

const navigation = [
    { name: 'Workflows', href: '/workflows' },
    { name: 'Members', href: '/members'  },
    { name: 'Questions', href: '/questions' },
]
const userNavigation = [
    // { name: 'Your Profile', href: '#' },
    // { name: 'Settings', href: '#' },
    // ...navigation,
    { name: 'Sign out', href: '/api/auth/logout' },
]


export default function DashboardLayout({
                                            children,
                                            currentPage,
                                            secondaryNav,
                                        }) {

    const {user} = useUser();
    const email = user?.email || "sample@exampl";
    //
    // const {data : userData ,error} = useSwrImmutable( "/api/v1/get-user-details" ,getFetcher);
    // const dispatch = useDispatch();
    //
    // useEffect(() => {
    //     dispatch(setUserDetails(userData));
    // }, [userData])
    //
    // const userDetail = useSelector((state) => state.userDetails.user)

    return (
        <>
            {/*
        This example requires updating your template:

        ```
        <html class="h-full">
        <body class="h-full">
        ```
      */}
            <div className="min-h-full">
                <Disclosure as="nav" className="border-b border-zinc-900 bg-white dark:bg-black">
                    {({ open }) => (
                        <>
                            <div className="mx-auto max-w-[1900px] px-2 sm:px-4">
                                <div className="flex h-12 justify-between">
                                    <div className="flex">
                                        <div className="flex flex-shrink-0 items-center">
                                            <Link href={"/"}>
                                            <h1 className={"text-3xl tracking-wider font-bold"}>
                                        <span className={"text-gradient "}>
                                            noOBS
                                        </span>
                                            </h1>
                                            </Link>
                                        </div>
                                        <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                                            {navigation.map((item) => (
                                                <a
                                                    key={item.name}
                                                    href={item.href}
                                                    className={clsx(
                                                        item.name.toLowerCase() === currentPage
                                                            ? 'border-indigo-500 text-zinc-800 dark:text-zinc-100'
                                                            : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:border-gray-300 hover:text-zinc-700',
                                                        'inline-flex items-center px-1 pt-1 border-b-2 text-normal font-medium'
                                                    )}
                                                    aria-current={item.name === currentPage ? 'page' : undefined}
                                                >
                                                    {item.name}
                                                </a>
                                            ))}
                                        </div>

                                    </div>

                                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                            {/*<ThemeSelector />*/}
                                        {/* Profile dropdown */}
                                        <Menu as="div" className="relative ml-3">
                                            <div>
                                                <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                                    <span className="sr-only">Open user menu</span>
                                                    <Avatar size={28} className={"rounded-full"} email={email} />
                                                </Menu.Button>
                                            </div>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-200"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    {userNavigation.map((item) => (
                                                        <Menu.Item key={item.name}>
                                                            {({ active }) => (
                                                                <a
                                                                    href={item.href}
                                                                    className={clsx(
                                                                        active ? 'bg-gray-100' : '',
                                                                        'block px-4 py-2 text-sm text-zinc-700'
                                                                    )}
                                                                >
                                                                    {item.name}
                                                                </a>
                                                            )}
                                                        </Menu.Item>
                                                    ))}
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </div>
                                    <div className="-mr-2 flex items-center sm:hidden">
                                        {/* Mobile menu button */}
                                        <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-zinc-400 hover:bg-gray-100 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                            <span className="sr-only">Open main menu</span>
                                            {open ? (
                                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                            ) : (
                                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                            )}
                                        </Disclosure.Button>
                                    </div>
                                </div>
                                <div>
                                    {
                                        secondaryNav
                                    }
                                </div>

                            </div>

                            <Disclosure.Panel className="sm:hidden">
                                <div className="space-y-1 pt-2 pb-3">
                                    {navigation.map((item) => (
                                        <Disclosure.Button
                                            key={item.name}
                                            as="a"
                                            href={item.href}
                                            className={clsx(
                                                item.current
                                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                    : 'border-transparent text-zinc-600 hover:bg-gray-50 hover:border-gray-300 hover:text-zinc-800',
                                                'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                                            )}
                                            aria-current={item.current ? 'page' : undefined}
                                        >
                                            {item.name}
                                        </Disclosure.Button>
                                    ))}
                                </div>
                                <div className="border-t border-gray-200 pt-4 pb-3">
                                    {/*<div className="flex items-center px-4">*/}
                                    {/*    <div className="flex-shrink-0">*/}
                                    {/*        /!*<img className="h-10 w-10 rounded-full" src={user.imageUrl} alt="" />*!/*/}
                                    {/*    </div>*/}
                                    {/*    <div className="ml-3">*/}
                                    {/*        /!*<div className="text-base font-medium text-zinc-800">{user.name}</div>*!/*/}
                                    {/*        /!*<div className="text-sm font-medium text-zinc-500">{user.email}</div>*!/*/}
                                    {/*    </div>*/}
                                    {/*    <button*/}
                                    {/*        type="button"*/}
                                    {/*        className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"*/}
                                    {/*    >*/}
                                    {/*        <span className="sr-only">View notifications</span>*/}
                                    {/*        <BellIcon className="h-6 w-6" aria-hidden="true" />*/}
                                    {/*    </button>*/}
                                    {/*</div>*/}
                                    <div className="mt-3 space-y-1">
                                        {userNavigation.map((item) => (
                                            <Disclosure.Button
                                                key={item.name}
                                                as="a"
                                                href={item.href}
                                                className="block px-4 py-2 text-base font-medium text-zinc-500 hover:bg-gray-100 hover:text-zinc-800"
                                            >
                                                {item.name}
                                            </Disclosure.Button>
                                        ))}
                                    </div>
                                </div>
                            </Disclosure.Panel>
                        </>
                    )}
                </Disclosure>

                <div className="py-4">
                    {/*<header>
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <h1 className="text-xl font-bold leading-6 pl-0">{currentPage}</h1>
                        </div>
                    </header>*/}
                    <main>
                        <div className="mx-auto max-w-[1900px]">
                            {/* Replace with your content */}
                            {
                                children
                            }
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}
