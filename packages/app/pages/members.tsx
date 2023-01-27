import React, { Fragment, useState } from 'react';

import PropTypes from 'prop-types';
import useSWR from 'swr';
import axios from 'axios';

import { Dialog, Transition } from '@headlessui/react'

import {
    LinkIcon, PlusIcon, QuestionMarkCircleIcon, XIcon
} from '@heroicons/react/outline';
import clsx from 'clsx';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import Head from "next/head";
import MemberItem from "@/interfaces/MemberItem";
import Avatar from "@/components/Avatar";
import { SearchIcon } from "@heroicons/react/solid";
import { member_role, obj_status } from "@prisma/client";


import Loader from '@/components/Loader';
import {PulseLoader} from 'react-spinners';




interface MemberFetchSearch {
    search: string
    by: string
}


const memberFetcher = async ([url, query]: [string, MemberFetchSearch]) => {
    const urlParams = new URLSearchParams();
    console.log(query);
    if (query.search) {
        urlParams.append(query.by, query.search);
    }
    const res = await axios.get(url, {
        params: urlParams
    });
    return res.data;
}

const Members = () => {

    const [search, setSearch] = useState('');
    const [searchBy, setSearchBy] = useState('district');


    const searchQuery: MemberFetchSearch = {
        search: search,
        by: searchBy
    };

    const { data, error, isValidating, isLoading, mutate } = useSWR(['/api/v1/member', searchQuery], memberFetcher);
    const [open, setOpen] = useState(false);

    const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);

    const members = data as MemberItem[] || [];

    const [saving,setSaving]=useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSearch(e.target.search.value);
        setSearchBy(e.target.searchBy.value);
    }

    const handleSelectMember = (member: MemberItem) => {
        setSelectedMember(member);
        setOpen(true);
    }

    const handleAddNewMember = () => {
        setSelectedMember(null);
        setOpen(true);
    }

    const handleAddUpdateMember = async (e: React.ChangeEvent<HTMLFormElement>) => {

        e.preventDefault();

        const member: MemberItem = {
            uuid: e.target?.uuid?.value,
            name: e.target["member-name"].value,
            role: e.target["member-role"].value || member_role.freelancer,
            district: e.target.district.value,
            state: e.target.state.value,
            status: e.target["member-status"].checked ? obj_status.active : obj_status.inactive,
            email: e.target.email.value,
            phone: e.target["member-phone"].value,
            address: e.target.address.value,
            pincode: e.target.pincode.value,
        }

        let res: MemberItem;
        if (member.uuid) {
            setSaving(true);
            res = await axios.put('/api/v1/member', member);
            setSaving(false)
        }
        else {
            setSaving(true);
            res = await axios.post('/api/v1/member', member);
            setSaving(false)
        }

        await mutate();

        setOpen(false);

    }

    console.log(error)
    if (error) return <div>failed to load</div>
    // if (isLoading) return < ClipLoader size={50} color={'#123abc'}  />
    


    return (
        <DashboardLayout currentPage={"members"} secondaryNav={<></>}>
            <Head>
                <title>Members</title>
            </Head>

        <Loader isLoading={isLoading}>
            <div className={"mt-2"}>
                <div className={"p-0 md:pl-4 sr-only"}>
                    <h1 className={"text-2xl font-bold"}>
                        Members
                    </h1>
                    <p className={"font-thin text-sm"}>
                        Create and manage members of your workflows.
                    </p>
                </div>

                <form onSubmit={handleSearch}>
                    <div className={"w-full flex gap-4 mb-2"}>

                        <div className={"flex grow"}>
                            <input type="search"
                                className={"input input-md w-full "}
                                placeholder={"Search members"}
                                name={"search"}
                                autoComplete={"off"}

                            />
                        </div>
                        <div className={""}>
                            <select className={"input input-md w-full"} name={"searchBy"} defaultValue={"district"}>
                                <option value={"district"}>Filter by District</option>
                                <option value={"state"}>Filter by State</option>
                                <option value={"name"}>Filter by Name</option>
                            </select>

                        </div>

                        <div className={""}>
                            <button className={"btn btn-md btn-secondary"} type={"submit"}>
                                <SearchIcon className={"h-5 w-5"} />
                                <span className={"sr-only"}>Search</span>
                            </button>
                        </div>

                        <div className={""}>
                            <button className={"btn btn-md btn-primary"} onClick={handleAddNewMember} type={"button"}>
                                Add Member
                            </button>
                        </div>

                    </div>
                </form>

                <div className={"w-full min-w-96 h-[600px] dark-theme"}>
                    <div className="overflow-x-auto w-full">
                        <table className="table w-full">

                            <thead>
                                <tr>
                                    {/*<th>*/}
                                    {/*    <label>*/}
                                    {/*        <input type="checkbox" className="checkbox"/>*/}
                                    {/*    </label>*/}
                                    {/*</th>*/}
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Geolocation</th>
                                    <th>Contact</th>
                                    <th>Address</th>
                                </tr>
                            </thead>
                            <tbody>

                                {
                                    members.map((member, index) => {
                                        // @ts-ignore
                                        return (
                                            <tr key={member.uuid} >
                                                {/*<th>*/}
                                                {/*    <label>*/}
                                                {/*        <input type="checkbox" className="checkbox"/>*/}
                                                {/*    </label>*/}
                                                {/*</th>*/}
                                                <td onClick={() => handleSelectMember(member)} className={"cursor-pointer"}>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="avatar">
                                                            <div className="mask mask-squircle w-12 h-12">
                                                                {/*@ts-ignore*/}
                                                                <Avatar email={member.email || member.name} size={12} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{member.name}</div>
                                                            <div className="text-sm opacity-50">{member.role}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={clsx("badge capitalize", { "badge-success": member.status === obj_status.active, "badge-warning": member.status === obj_status.inactive })}>
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {member.district}, {member.state}
                                                </td>
                                                <td>
                                                    <a href={`tel:${member.phone}`} className="text-sm opacity-50">{member.phone}</a>
                                                    <br />
                                                    <a href={`mailto:${member.email}`} className="text-sm opacity-50">{member.email}</a>
                                                </td>
                                                <td>
                                                    <div className="text-sm opacity-50">{member.address}</div>
                                                    <span className="badge badge-ghost badge-sm">{member.pincode}</span>
                                                </td>
                                            </tr>)
                                    })
                                }

                            </tbody>

                        </table>
                    </div>
                </div>


            </div>


            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={setOpen}>
                    <div className="fixed inset-0" />

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                                <Transition.Child
                                    as={Fragment}
                                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                                    enterFrom="translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                                    leaveFrom="translate-x-0"
                                    leaveTo="translate-x-full"
                                >
                                    <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                        <form onSubmit={handleAddUpdateMember} className="flex h-full flex-col divide-y divide-gray-200 bg-base-100 shadow-xl">
                                            <div className="h-0 flex-1 overflow-y-auto">
                                                <div className="bg-neutral py-6 px-4 sm:px-6">
                                                    <div className="flex items-center justify-between">
                                                        <Dialog.Title className="text-lg font-medium ">Member</Dialog.Title>
                                                        <div className="ml-3 flex h-7 items-center">
                                                            <button
                                                                type="button"
                                                                className="rounded-md bg-error text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                                                onClick={() => setOpen(false)}
                                                            >
                                                                <span className="sr-only">Close panel</span>
                                                                <XIcon className="h-6 w-6" aria-hidden="true" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-1">
                                                        <p className="text-sm ">
                                                            Add / modify member in the list.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div className="divide-y divide-gray-200 px-4 sm:px-6">
                                                        <div className="space-y-6 pt-6 pb-5">
                                                            <div>
                                                                <label htmlFor="user-name" className="block text-sm font-medium">
                                                                    Name<span className={"text-red-500"}>*</span>
                                                                </label>
                                                                <div className="mt-1">
                                                                    <input
                                                                        type="text"
                                                                        name="member-name"
                                                                        defaultValue={selectedMember ? selectedMember.name : ""}
                                                                        id="user-name"
                                                                        placeholder={"Enter name"}
                                                                        className="input  input-bordered w-full"
                                                                    />
                                                                    {
                                                                        // if update, show the uuid will be present, and hence the form will be in update mode
                                                                        selectedMember &&
                                                                        <input type={"hidden"} name={"uuid"}
                                                                            value={selectedMember?.uuid} />
                                                                    }
                                                                </div>
                                                            </div>

                                                            <div className={"flex gap-2"}>
                                                                <div className={"grow"}>
                                                                    <label htmlFor="role" className="block text-sm font-medium ">
                                                                        Role<span className={"text-red-500"}>*</span>
                                                                    </label>
                                                                    <div className="mt-1">
                                                                        <select id="role" name="member-role" className="select  select-bordered w-full"
                                                                            defaultValue={selectedMember ? selectedMember.role : "freelancer"}
                                                                            disabled={selectedMember ? selectedMember.role === "admin" : false}
                                                                        >
                                                                            <option value={"freelancer"}>Freelancer</option>
                                                                            <option value={"associate"}>Associate</option>
                                                                            <option value={"manager"}>Manager</option>
                                                                            <option value={"admin"}>Admin</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className={"shrink flex items-center mt-6 gap-2"}>
                                                                    <label htmlFor="status" className="block text-sm font-medium ">
                                                                        Active
                                                                    </label>
                                                                    <div className="mt-1">
                                                                        <input type="checkbox" name={"member-status"} id="status"
                                                                            className="toggle toggle-error"
                                                                            defaultChecked={selectedMember ? selectedMember?.status === obj_status.active : false}
                                                                            disabled={selectedMember ? selectedMember.role === "admin" : false}
                                                                        />
                                                                    </div>
                                                                </div>

                                                            </div>

                                                            <div>
                                                                <label htmlFor="phone" className="block text-sm font-medium ">
                                                                    Phone<span className={"text-red-500"}>*</span>
                                                                </label>
                                                                <div className="mt-1">
                                                                    <input
                                                                        type="text"
                                                                        name="member-phone"
                                                                        id="phone"
                                                                        defaultValue={selectedMember ? selectedMember.phone : ""}
                                                                        placeholder={"+91 1234567890"}
                                                                        className="input  input-bordered w-full"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label htmlFor="email" className="block text-sm font-medium ">
                                                                    Email<span className={"text-red-500"}>*</span>
                                                                </label>
                                                                <div className="mt-1">
                                                                    <input
                                                                        type="text"
                                                                        name="email"
                                                                        id="email"
                                                                        defaultValue={selectedMember ? selectedMember.email : ""}
                                                                        placeholder={"Eg: someone@example.com"}
                                                                        className="input  input-bordered w-full"
                                                                    />
                                                                </div>
                                                            </div>


                                                            <div>
                                                                <label htmlFor="district" className="block text-sm font-medium ">
                                                                    District<span className={"text-red-500"}>*</span>
                                                                </label>
                                                                <div className="mt-1">
                                                                    <input
                                                                        type="text"
                                                                        name="district"
                                                                        id="phone"
                                                                        defaultValue={selectedMember ? selectedMember.district : ""}
                                                                        placeholder={"Eg. Bangalore"}
                                                                        className="input  input-bordered w-full"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label htmlFor="state" className="block text-sm font-medium ">
                                                                    State<span className={"text-red-500"}>*</span>
                                                                </label>
                                                                <div className="mt-1">
                                                                    <input
                                                                        type="text"
                                                                        name="state"
                                                                        id="state"
                                                                        defaultValue={selectedMember ? selectedMember.state : ""}
                                                                        placeholder={"Eg. Karnataka"}
                                                                        className="input  input-bordered w-full"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label htmlFor="pincode" className="block text-sm font-medium ">
                                                                    Pincode
                                                                </label>
                                                                <div className="mt-1">
                                                                    <input
                                                                        type="text"
                                                                        name="pincode"
                                                                        id="pincode"
                                                                        defaultValue={selectedMember ? selectedMember.pincode : ""}
                                                                        placeholder={"Eg. 560001"}
                                                                        className="input  input-bordered w-full"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label htmlFor="address" className="block text-sm font-medium ">
                                                                    Address
                                                                </label>
                                                                <div className="mt-1">
                                                                    <textarea
                                                                        name="address"
                                                                        id="address"
                                                                        defaultValue={selectedMember ? selectedMember.address : ""}
                                                                        placeholder={"Eg. 123, 4th Cross, 5th Main, 6th Block"}
                                                                        className="textarea textarea-bordered w-full"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-shrink-0 justify-end px-4 py-4">
                                                <button
                                                    type="button"
                                                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                    onClick={() => setOpen(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                    disabled={saving}
                                                >
                                                    Save{saving && <PulseLoader color="#36d7b7" size={5} />}
                                                </button>
                                            </div>
                                        </form>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </Loader>

        </DashboardLayout>
    );
};

Members.propTypes = {

};


export default Members;