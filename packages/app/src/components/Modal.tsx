import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {Dialog, Transition} from "@headlessui/react";

type ModalProps = {
    open: boolean,
    onClose: () => void,
    afterLeave?: () => void,
    children?: React.ReactNode,
    title?: string,
    description?: string,

}

const Modal = ({open, onClose ,afterLeave = onClose, title, description, children}: ModalProps) => {
    return (
        <Transition.Root show={open} as={Fragment} afterLeave={afterLeave} appear>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="mx-auto max-w-2xl transform rounded-xl bg-black p-4 shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
                            {
                                title &&
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6">
                                  {title}
                                </Dialog.Title>
                            }
                            {
                                description &&
                                <Dialog.Description className=" text-sm font-thin text-zinc-400">
                                    {description}
                                </Dialog.Description>
                            }
                            <div className={"mt-4"}>
                                {
                                    children
                                }
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

Modal.propTypes = {

};

export default Modal;