import React from "react";
import { Modal } from "antd";
import type { ModalProps } from "antd";
import "./styles.css";

interface CustomModalProps extends ModalProps {
    children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({ children, ...props }) => {
    return (
        <Modal
            {...props}
            className="custom-modal"
            footer={null}
            closable={true}
            maskClosable={true}
            centered
        >
            {children}
        </Modal>
    );
};

export default CustomModal;
