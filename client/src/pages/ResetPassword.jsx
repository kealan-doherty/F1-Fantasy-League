import '../App.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function ResetPassword() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event) => {
        const {name, value} = event.target;
        setFormData((previous) =>({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors([]);
        setIsSubmitting(true);

        try {
            const response = await fetch('/')
        }
    }
}

export default ResetPassword;