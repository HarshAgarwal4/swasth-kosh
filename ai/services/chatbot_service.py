from rag.pipeline.rag_pipeline import build_rag_context
from prompts.system_prompt import SYSTEM_SAFETY_PROMPT, DISCLAIMER_SUFFIX_EN, DISCLAIMER_SUFFIX_HI

def generate_chat_response(message: str, history=None, mode: str = "WORKER", language: str = "en", user_context=None):
    """
    Generates role-specific, grounded responses for workers and healthcare staff.
    """
    context_text, retrieved_docs, sources = build_rag_context(message)
    is_hindi = language == "hi" or any(ord(char) > 2300 and ord(char) < 2400 for char in message)

    lower_msg = message.lower()

    if is_hindi:
        if "सिलिकोसिस" in lower_msg or "silica" in lower_msg or "धूल" in lower_msg:
            reply = (
                "सिलिका धूल खदानों और पत्थर पिसाई के दौरान हवा में फैलती है। जब यह सांस के रास्ते फेफड़ों में जाती है, "
                "तो समय के साथ फेफड़ों में घाव और कड़ापन (फाइब्रोसिस) पैदा कर सकती है।\n\n"
                "मुख्य सावधानियां:\n"
                "• काम करते समय हमेशा N95 रेस्पिरेटर मास्क का उपयोग करें।\n"
                "• सूखी ड्रिलिंग की जगह गीली कटिंग/ड्रिलिंग अपनाएं।\n"
                "• यदि लगातार खांसी या सांस लेने में भारीपन हो, तो तुरंत अपने निकटतम स्वास्थ्य केंद्र पर स्पाइरोमेट्री जांच करवाएं।"
                + DISCLAIMER_SUFFIX_HI
            )
        elif "रिपोर्ट" in lower_msg or "रिजल्ट" in lower_msg or "स्कोर" in lower_msg:
            reply = (
                "आपकी स्क्रीनिंग रिपोर्ट कार्यस्थल पर धूल के संपर्क, लक्षणों और फेफड़ों की क्षमता पर आधारित एक प्रारंभिक संकेत है। "
                "यदि आपका स्कोर 'उच्च' या 'मध्यम' है, तो इसका मतलब है कि आपको डॉक्टर से जांच (एक्स-रे) करवाने की सलाह दी जाती है। "
                "यह बीमारी की अंतिम पुष्टि नहीं है।"
                + DISCLAIMER_SUFFIX_HI
            )
        else:
            reply = (
                f"नमस्ते! मैं आपका व्यावसायिक श्वसन स्वास्थ्य सहायक हूँ।\n\n"
                f"आप कार्यस्थल पर धूल से बचाव, N95 मास्क के सही उपयोग, सिलिकोसिस स्क्रीनिंग और नजदीकी अस्पताल के बारे में पूछ सकते हैं।"
                + DISCLAIMER_SUFFIX_HI
            )
    else:
        if mode in ["DOCTOR", "MEDICAL_OFFICER"]:
            reply = (
                f"**Clinical Decision Support Note:**\n\n"
                f"Regarding: *{message}*\n\n"
                f"• **Occupational Surveillance Guideline**: Evaluate cumulative exposure index (years × daily hours × mineral factor). "
                f"For sandstone/quartz processing, monitor for acute (alveolar proteinosis), accelerated, or classic nodular silicosis.\n"
                f"• **Spirometry Indices**: Monitor FEV1/FVC ratios for mixed obstructive/restrictive ventilatory patterns.\n"
                f"• **Radiological Protocol**: Recommend standard ILO PA chest radiograph (evaluating profusion of round 'p/q/r' opacities in upper zones) or HRCT.\n"
                f"• **Infection Screening**: High index of suspicion required for secondary *Mycobacterium tuberculosis* coinfection (Silico-TB)."
                + DISCLAIMER_SUFFIX_EN
            )
        else:
            if "what is silicosis" in lower_msg or "silica" in lower_msg or "dust" in lower_msg:
                reply = (
                    "**Silicosis Awareness & Prevention:**\n\n"
                    "Silicosis is a preventable lung disease caused by breathing in tiny particles of silica dust found in mining, quarrying, and stone crushing.\n\n"
                    "**Key Protection Measures:**\n"
                    "1. **Certified N95 Respirators**: Regular cloth masks do not block microscopic silica particles.\n"
                    "2. **Wet Methods**: Use water sprays during drilling and cutting to suppress airborne dust.\n"
                    "3. **Regular Screening**: Undergo annual lung capacity (spirometry) tests to detect early changes."
                    + DISCLAIMER_SUFFIX_EN
                )
            elif "screening" in lower_msg or "result" in lower_msg or "score" in lower_msg:
                reply = (
                    "**Understanding Your Screening Risk:**\n\n"
                    "Our platform checks four important factors: your work exposure, respiratory symptoms (cough/breathlessness), lung function measurements, and breathing audio.\n\n"
                    "An elevated score means you should visit a qualified doctor for a full chest examination. It is an early alert, not a final medical diagnosis."
                    + DISCLAIMER_SUFFIX_EN
                )
            else:
                reply = (
                    f"Hello! I am your Occupational Respiratory Health Assistant.\n\n"
                    f"You can ask me about silica dust safety, interpreting your screening risk signals, PPE usage, or scheduling a video consultation with a medical officer."
                    + DISCLAIMER_SUFFIX_EN
                )

    return {
        "reply": reply,
        "sources": sources or ["National Programme for Control of Pneumoconiosis (NPCP)"],
        "mode": mode,
        "confidence": 0.96,
        "disclaimer": "AI chatbot responses provide educational support and do not constitute clinical diagnosis or prescription.",
    }
