import React from 'react';
import Avatar from "@/components/Avatar";
import {useUser} from "@auth0/nextjs-auth0/client";


const ProfileSettingsTab = () => {
    const {user} = useUser();

    return (
        <div>
            <div className="mt-10 divide-y divide-gray-200">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium leading-6 ">Profile</h3>
                    <p className="max-w-2xl text-sm text-gray-400">
                        This information will be displayed publicly so be careful what you share.
                    </p>
                </div>
                <div className="mt-6">
                    <dl className="divide-y divide-gray-200">
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                            <dt className="text-sm font-medium text-gray-400">Name</dt>
                            <dd className="mt-1 flex text-sm  sm:col-span-2 sm:mt-0">
                                                <span className="flex-grow">
                                                    {user?.name}
                                                </span>
                                <span className="ml-4 flex-shrink-0">
                                  {/*<button*/}
                                    {/*    type="button"*/}
                                    {/*    className="rounded-md  font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"*/}
                                    {/*>*/}
                                    {/*  Update*/}
                                    {/*</button>*/}
                                </span>
                            </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:pt-5">
                            <dt className="text-sm font-medium text-gray-400">Photo</dt>
                            <dd className="mt-1 flex text-sm  sm:col-span-2 sm:mt-0">
                                <span className="flex-grow">
                                    {
                                        // user?.picture ?
                                        // <img src={user?.picture} className="h-8 w-8 rounded-full" alt=""/> :
                                        <>
                                            {/*  @ts-ignore */}
                                            <Avatar email={user?.email}/>
                                        </>}
                                </span>
                                {/*                    <span className="ml-4 flex flex-shrink-0 items-start space-x-4">*/}
                                {/*  <button*/}
                                {/*      type="button"*/}
                                {/*      className="rounded-md  font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"*/}
                                {/*  >*/}
                                {/*    Update*/}
                                {/*  </button>*/}
                                {/*  <span className="text-gray-300" aria-hidden="true">*/}
                                {/*    |*/}
                                {/*  </span>*/}
                                {/*  <button*/}
                                {/*      type="button"*/}
                                {/*      className="rounded-md  font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"*/}
                                {/*  >*/}
                                {/*    Remove*/}
                                {/*  </button>*/}
                                {/*</span>*/}
                            </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:pt-5">
                            <dt className="text-sm font-medium text-gray-400">Email</dt>
                            <dd className="mt-1 flex text-sm  sm:col-span-2 sm:mt-0">
                                <span className="flex-grow">{user?.email}</span>
                                <span className="ml-4 flex-shrink-0">
                                  {/*<button*/}
                                    {/*    type="button"*/}
                                    {/*    className="rounded-md  font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"*/}
                                    {/*>*/}
                                    {/*  Update*/}
                                    {/*</button>*/}
                                </span>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="mt-10 divide-y divide-gray-200">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium leading-6 ">Account</h3>
                    <p className="max-w-2xl text-sm text-gray-400">
                        Manage how information is displayed on your account.
                    </p>
                </div>
                <div className="mt-6">
                    <dl className="divide-y divide-gray-200">
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                            <dt className="text-sm font-medium text-gray-400">Language</dt>
                            <dd className="mt-1 flex text-sm  sm:col-span-2 sm:mt-0">
                                <span className="flex-grow">English</span>
                                <span className="ml-4 flex-shrink-0">
                                  <button
                                      type="button"
                                      className="rounded-md  font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                  >
                                    Update
                                  </button>
                                </span>
                            </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:pt-5">
                            <dt className="text-sm font-medium text-gray-400">Date format</dt>
                            <dd className="mt-1 flex text-sm  sm:col-span-2 sm:mt-0">
                                <span className="flex-grow">DD-MM-YYYY</span>
                                <span className="ml-4 flex flex-shrink-0 items-start space-x-4">
                                  <button
                                      type="button"
                                      className="rounded-md  font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                  >
                                    Update
                                  </button>
                                  <span className="text-gray-300" aria-hidden="true">
                                    |
                                  </span>
                                  <button
                                      type="button"
                                      className="rounded-md  font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                  >
                                    Remove
                                  </button>
                                </span>
                            </dd>
                        </div>

                    </dl>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsTab;