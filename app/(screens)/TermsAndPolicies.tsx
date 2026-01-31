import { MigratedStyles } from '@/constants/MigratedStyles';
import { Theme } from '@/constants/Theme';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const termsAndConditions_EN = {
  title: 'Terms and Conditions of Use for THE NATIONAL BUILDERS Mobile App and Web Platform (U.S.)',
  sections: [
    {
      heading: 'Contact Information & Table of Contents',
      body: 'THE NATIONAL BUILDERS www.TheNationalBuilders.com\nPhone: 1-862-277-0131 ; term&condition@thenationalbuilders.com',
    },
    {
      heading: '1. Introduction and Acceptance',
      body: 'Access and use of THE NATIONAL BUILDERS mobile application (“the App”) and the associated website, including any digital interface or online platform (collectively, “the Service” or “the Platform”), constitutes full and unconditional acceptance of these terms and conditions, forming a legally binding agreement between you (“User”) and THE NATIONAL BUILDERS, LLC, in accordance with the laws of the State of Texas and applicable US federal regulations, including the Texas Business and Commerce Code and the Federal Trade Commission Act (15 U.S.C. §§ 41-58).',
    },
    {
      heading: '2. Minimum Age and Requirements (COPPA)',
      body: 'By using the Service, you represent and warrant that you are at least 18 years old, or the legal age of majority in your jurisdiction, and are not less than 13 years old, in accordance with the Children\'s Online Privacy Protection Act (COPPA, 15 U.S.C. §§ 6501-6506). THE NATIONAL BUILDERS does not knowingly collect data from minors; accounts found to be in violation of this policy will be deleted.',
    },
    {
      heading: '3. Account Registration and Security',
      body: 'Account registration requires you to provide truthful, accurate, current, and complete information. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. THE NATIONAL BUILDERS reserves the right to suspend or terminate accounts suspected of fraudulent use or violation of these terms, in accordance with Texas law and the Federal Trade Commission Act.',
    },
    {
      heading: '4. In-App Purchases',
      body: 'Purchases made through the App are subject to the terms and conditions of the respective app store (Apple App Store, Google Play, etc.) and applicable federal and state laws regarding e-commerce and consumer protection, including the Texas Business and Commerce Code, the Federal Trade Commission Act, and the Electronic Signatures in Global and National Commerce Act (E-SIGN Act, 15 U.S.C. §§ 7001-7031).',
    },
    {
      heading: '5. Purchase of Goods and Services',
      body: '5.1. All purchases of goods and services offered through the Service are subject to availability, current prices, and any specific conditions stated on the platform. 5.2. The contract of sale is governed by Texas laws and applicable federal regulations, including the Uniform Commercial Code (UCC) adopted in Texas. 5.3. Returns and Refunds: Unless otherwise required by applicable law, all purchases of goods, services, and subscriptions are final and non-refundable. If THE NATIONAL BUILDERS chooses to grant a refund, it will be at its sole discretion and governed by the return policy published on the Website at that time.',
    },
    {
      heading: '6. Subscription Plans',
      body: 'The Service may offer recurring subscription plans, which will automatically renew unless the user cancels them before the renewal date. Payment and cancellation terms are governed by these terms and applicable law, including the E-SIGN Act and the Texas Business and Commerce Code.',
    },
    {
      heading: '7. User-Generated Content',
      body: 'You are solely responsible for any content, information, images, comments, or files that you post or share through the Service. By doing so, you grant THE NATIONAL BUILDERS a worldwide, irrevocable, non-exclusive, royalty-free license to use, reproduce, modify, adapt, and display such content as permitted by law, including the Copyright Act (17 U.S.C. §§ 101 et seq.) and the Digital Millennium Copyright Act (DMCA, 17 U.S.C. § 512).',
    },
    {
      heading: '8. User Feedback',
      body: 'Any suggestions, comments, or feedback you submit may be used by THE NATIONAL BUILDERS for any purpose without obligation of compensation. You waive any moral or proprietary rights to such feedback under the Copyright Act and applicable Texas law.',
    },
    {
      heading: '9. Promotions and Contests',
      body: 'Promotions and contests organized through the Service are subject to the specific rules of each event, which will be communicated in advance. Participation constitutes acceptance of these rules and applicable US laws regarding contests and sweepstakes, including the Federal Trade Commission Act and Texas state law.',
    },
    {
      heading: '10. Service Use Policy',
      body: 'You agree to use the Service only for lawful purposes and in compliance with applicable laws, including the Computer Fraud and Abuse Act (18 U.S.C. § 1030) and Texas law. Any use that could damage, disable, overburden, or impair the Service or interfere with other users\' enjoyment is prohibited. THE NATIONAL BUILDERS may restrict access in case of misuse.',
    },
    {
      heading: '11. Intellectual Property Rights',
      body: 'All intellectual property rights in the Service, its code, design, trademarks, logos, content, and features belong to THE NATIONAL BUILDERS, LLC or its licensors, under the Copyright Act (17 U.S.C. §§ 101 et seq.), the Lanham Act (15 U.S.C. §§ 1051 et seq.), and Texas state law.',
    },
    {
      heading: '12. Third-Party Services',
      body: 'The Service may contain links or integrations to third-party services. THE NATIONAL BUILDERS is not responsible for the availability, content, policies, or practices of such external services. The use of third-party services is subject to their own terms and Texas law.',
    },
    {
      heading: '13. Prohibited Uses and Restrictions',
      body: 'Using the Service for illegal, fraudulent, automated purposes, reverse engineering, scraping, distributing malware, spam, identity theft, offensive content, or violating third-party rights is strictly prohibited, in accordance with the Computer Fraud and Abuse Act, DMCA, and Texas law.',
    },
    {
      heading: '14. Termination Rights',
      body: 'THE NATIONAL BUILDERS reserves the right, in its sole discretion and without prior notice, to suspend or terminate any user\'s access to the Service for violation of these terms, applicable law, or if the user poses a risk to the security or integrity of the Service, in accordance with Texas law.',
    },
    {
      heading: '15. Disclaimer of Warranties',
      body: 'The Service and all its services are provided "as is" and "as available," without warranty of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement, to the maximum extent permitted by US law (Uniform Commercial Code, Texas Business and Commerce Code).',
    },
    {
      heading: '16. Limitation of Liability',
      body: 'In no event shall THE NATIONAL BUILDERS, its directors, employees, or affiliates be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses, arising from the use or inability to use the Service, except as required by applicable law (Texas Civil Practice and Remedies Code).',
    },
    {
      heading: '17. Indemnification',
      body: 'You agree to indemnify and hold harmless THE NATIONAL BUILDERS, its directors, employees, and affiliates from any claim, demand, damage, loss, or expense (including reasonable legal fees) arising from your use of the Service, your content, or your violation of these terms, under Texas law.',
    },
    {
      heading: '18. Force Majeure',
      body: 'THE NATIONAL BUILDERS shall not be liable for failures or delays in the performance of its obligations due to causes beyond its reasonable control, including but not limited to natural disasters, wars, pandemics, technological failures, or government actions, in accordance with the Texas Business and Commerce Code.',
    },
    {
      heading: '19. Governing Law and Jurisdiction',
      body: 'These terms are governed and construed in accordance with the laws of the State of Texas and applicable US federal law. Any dispute shall be submitted to the competent courts in Texas (Texas Civil Practice and Remedies Code).',
    },
    {
      heading: '20. Dispute Resolution and Binding Arbitration (Replaces original Section 20)',
      body: '20.1. Binding Arbitration: Any controversy, dispute, or claim arising out of or relating to these Terms, the Service, or any product or service provided through it, shall be resolved by individual binding arbitration before the American Arbitration Association (AAA) in accordance with its Commercial Arbitration Rules, based in [INSERT NAME OF COUNTY IN TEXAS] County, Texas. The arbitrator\'s decision shall be final and binding. 20.2. Class Action Waiver: To the maximum extent permitted by law, you and THE NATIONAL BUILDERS waive any right to litigate disputes in court before a judge or jury, or to participate as a plaintiff or class member in any class action, collective arbitration, or representative action. This means that any dispute must be resolved individually and cannot be combined with the disputes of others. 20.3. Exceptions: Notwithstanding the foregoing, either party may bring an individual action in a Texas small claims court or seek injunctive or equitable relief in a competent court to protect its intellectual property rights.',
    },
    {
      heading: '21. Changes to Terms',
      body: 'THE NATIONAL BUILDERS may modify these terms and conditions at any time. Changes will be notified on the Service and/or by email, and continued use of the Service after notification constitutes acceptance of the new terms, in accordance with the Texas Business and Commerce Code.',
    },
    {
      heading: '22. App License Terms',
      body: 'You are granted a limited, revocable, non-exclusive, non-transferable license to download, install, and use the App solely for personal purposes and in accordance with these terms. Any unauthorized use is expressly prohibited under Texas law.',
    },
    {
      heading: '23. App Store Compliance',
      body: 'You also agree to comply with the terms and conditions of the app store from which you downloaded the App (Apple App Store, Google Play, etc.), including update, payment, and refund policies, pursuant to US law.',
    },
    {
      heading: '24. Hosting, Delivery, and Support',
      body: 'The Service and its services are hosted on secure and certified servers. Notifications, purchase confirmations, and deliveries may be made by email or other electronic means, in accordance with the E-SIGN Act and Texas law. THE NATIONAL BUILDERS provides technical support through the official channels indicated in the Service.',
    },
    {
      heading: '25. Contact Information',
      body: 'For inquiries, support, or complaints, contact us through the Service or by phone at 1-862-277-0131. You can also write to the official email address indicated in the Service.',
    },
    {
      heading: '26. Privacy Policy and Data Consent',
      body: 'THE NATIONAL BUILDERS\' Privacy Policy is incorporated by reference into these Terms and Conditions and forms an integral part thereof. The Privacy Policy describes how THE NATIONAL BUILDERS collects, uses, and protects your personal information. By using the Service, you acknowledge that you have read and understood the Privacy Policy and agree to the processing of your personal data in accordance therewith.',
    },
    {
      heading: '27. Construction Content and Advice Disclaimer',
      body: 'THE NATIONAL BUILDERS is not a licensed architectural, engineering, or construction firm. The Service may provide tools, estimates, directories, or general information about the construction industry. Such information is provided for informational purposes only and does not constitute professional, legal, financial, engineering, or construction advice. Your reliance on any information offered through the Service is strictly at your own risk. You are solely responsible for hiring and supervising qualified, licensed professionals for any construction or repair project.',
    },
  ],
};

const termsAndPolicies_ES = {
  title: 'Términos y Condiciones de Uso para la Aplicación Móvil y Plataforma Web de THE NATIONAL BUILDERS (EE. UU.)',
  sections: [
    {
      heading: 'Información de Contacto y Tabla de Contenidos',
      body: 'THE NATIONAL BUILDERS www.TheNationalBuilders.com\nTeléfono: 1-862-277-0131 ; term&condition@thenationalbuilders.com',
    },
    {
      heading: '1. Introducción y Aceptación',
      body: 'El acceso y uso de la aplicación móvil de THE NATIONAL BUILDERS (“la App”) y el sitio web asociado, incluyendo cualquier interfaz digital o plataforma en línea (colectivamente, “el Servicio” o “la Plataforma”), constituye la aceptación plena e incondicional de estos términos y condiciones, formando un acuerdo legalmente vinculante entre usted (“Usuario”) y THE NATIONAL BUILDERS, LLC, de conformidad con las leyes del Estado de Texas y las regulaciones federales aplicables de EE. UU., incluyendo el Texas Business and Commerce Code y el Federal Trade Commission Act (15 U.S.C. §§ 41-58).',
    },
    {
      heading: '2. Edad Mínima y Requisitos (COPPA)',
      body: 'Al usar el Servicio, usted declara y garantiza que tiene al menos 18 años, o la edad legal de la mayoría de edad en su jurisdicción, y que no tiene menos de 13 años, de conformidad con la Ley de Protección de la Privacidad Infantil en Línea (COPPA, 15 U.S.C. §§ 6501-6506). THE NATIONAL BUILDERS no recopila datos a sabiendas de menores; las cuentas que se encuentren violando esta política serán eliminadas.',
    },
    {
      heading: '3. Registro de Cuenta y Seguridad',
      body: 'El registro de la cuenta requiere que usted proporcione información veraz, precisa, actual y completa. Usted es responsable de mantener la confidencialidad de sus credenciales de inicio de sesión y de todas las actividades realizadas bajo su cuenta. THE NATIONAL BUILDERS se reserva el derecho de suspender o cancelar cuentas sospechosas de uso fraudulento o violación de estos términos, de acuerdo con la ley de Texas y la Ley de la Comisión Federal de Comercio.',
    },
    {
      heading: '4. Compras Dentro de la Aplicación',
      body: 'Las compras realizadas a través de la App están sujetas a los términos y condiciones de la tienda de aplicaciones respectiva (Apple App Store, Google Play, etc.) y a las leyes federales y estatales sobre comercio electrónico y protección al consumidor, incluyendo el Código de Comercio y Negocios de Texas, la Ley de la Comisión Federal de Comercio y la Ley de Firmas Electrónicas en el Comercio Global y Nacional (E-SIGN Act, 15 U.S.C. §§ 7001-7031).',
    },
    {
      heading: '5. Compra de Bienes y Servicios',
      body: '5.1. Todas las compras de bienes y servicios ofrecidos a través del Servicio están sujetas a disponibilidad, precios actuales y cualquier condición específica indicada en la plataforma. 5.2. El contrato de venta se rige por las leyes de Texas y las regulaciones federales aplicables, incluyendo el Código Comercial Uniforme (UCC) adoptado en Texas. 5.3. Devoluciones y Reembolsos: A menos que la ley aplicable exija lo contrario, todas las compras de bienes, servicios y suscripciones son definitivas y no reembolsables. Si THE NATIONAL BUILDERS decide otorgar un reembolso, se hará a su entera discreción y se regirá por la política de devoluciones publicada en el Sitio Web en ese momento.',
    },
    {
      heading: '6. Planes de Suscripción',
      body: 'El Servicio puede ofrecer planes de suscripción recurrentes, los cuales se renovarán automáticamente a menos que el usuario los cancele antes de la fecha de renovación. Los términos de pago y cancelación se rigen por estos términos y la ley aplicable, incluyendo la Ley E-SIGN y el Código de Comercio y Negocios de Texas.',
    },
    {
      heading: '7. Contenido Generado por el Usuario',
      body: 'Usted es el único responsable de cualquier contenido, información, imágenes, comentarios o archivos que publique o comparta a través del Servicio. Al hacerlo, usted otorga a THE NATIONAL BUILDERS una licencia mundial, irrevocable, no exclusiva y libre de regalías para usar, reproducir, modificar, adaptar y mostrar dicho contenido según lo permita la ley, incluyendo la Ley de Derechos de Autor (17 U.S.C. §§ 101 et seq.) y la Ley de Derechos de Autor del Milenio Digital (DMCA, 17 U.S.C. § 512).',
    },
    {
      heading: '8. Comentarios del Usuario',
      body: 'Cualquier sugerencia, comentario o feedback que envíe puede ser utilizado por THE NATIONAL BUILDERS para cualquier propósito sin obligación de compensación. Usted renuncia a cualquier derecho moral o de propiedad sobre dicho feedback según la Ley de Derechos de Autor y la ley de Texas aplicable.',
    },
    {
      heading: '9. Promociones y Concursos',
      body: 'Las promociones y concursos organizados a través del Servicio están sujetos a las reglas específicas de cada evento, las cuales serán comunicadas con antelación. La participación constituye la aceptación de dichas reglas y de las leyes estadounidenses aplicables sobre concursos y sorteos, incluyendo la Ley de la Comisión Federal de Comercio y la ley estatal de Texas.',
    },
    {
      heading: '10. Política de Uso del Servicio',
      body: 'Usted acepta utilizar el Servicio solo para fines lícitos y en cumplimiento de las leyes aplicables, incluida la Ley de Abuso y Fraude Informático (18 U.S.C. § 1030) y la ley de Texas. Está prohibido cualquier uso que pueda dañar, deshabilitar, sobrecargar o deteriorar el Servicio o interferir con el disfrute de otros usuarios. THE NATIONAL BUILDERS puede restringir el acceso en caso de uso indebido.',
    },
    {
      heading: '11. Derechos de Propiedad Intelectual',
      body: 'Todos los derechos de propiedad intelectual en el Servicio, su código, diseño, marcas comerciales, logotipos, contenido y características pertenecen a THE NATIONAL BUILDERS, LLC o a sus licenciantes, bajo la Ley de Derechos de Autor (17 U.S.C. §§ 101 et seq.), la Ley Lanham (15 U.S.C. §§ 1051 et seq.) y la ley estatal de Texas.',
    },
    {
      heading: '12. Servicios de Terceros',
      body: 'El Servicio puede contener enlaces o integraciones a servicios de terceros. THE NATIONAL BUILDERS no es responsable de la disponibilidad, el contenido, las políticas o las prácticas de dichos servicios externos. El uso de servicios de terceros está sujeto a sus propios términos y a la ley de Texas.',
    },
    {
      heading: '13. Usos Prohibidos y Restricciones',
      body: 'El uso del Servicio para fines ilegales, fraudulentos, automatizados, ingeniería inversa, scraping, distribución de malware, spam, suplantación de identidad, contenido ofensivo o violación de derechos de terceros está estrictamente prohibido, de conformidad con la Ley de Abuso y Fraude Informático, DMCA y la ley de Texas.',
    },
    {
      heading: '14. Derechos de Terminación',
      body: 'THE NATIONAL BUILDERS se reserva el derecho, a su sola discreción y sin previo aviso, de suspender o terminar el acceso de cualquier usuario al Servicio por violación de estos términos, la ley aplicable, o si el usuario representa un riesgo para la seguridad o integridad del Servicio, de acuerdo con la ley de Texas.',
    },
    {
      heading: '15. Descargo de Garantías',
      body: 'El Servicio y todos sus servicios se proporcionan "tal cual" y "según disponibilidad", sin garantía de ningún tipo, expresa o implícita, incluidas, entre otras, comerciabilidad, idoneidad para un propósito particular o no infracción, en la máxima medida permitida por la ley de EE. UU. (Código Comercial Uniforme, Código de Comercio y Negocios de Texas).',
    },
    {
      heading: '16. Limitación de Responsabilidad',
      body: 'En ningún caso THE NATIONAL BUILDERS, sus directores, empleados o afiliados serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluida la pérdida de ganancias, datos u otras pérdidas intangibles, que surjan del uso o la imposibilidad de usar el Servicio, excepto según lo exija la ley aplicable (Código de Práctica Civil y Remedios de Texas).',
    },
    {
      heading: '17. Indemnización',
      body: 'Usted acepta indemnizar y eximir de responsabilidad a THE NATIONAL BUILDERS, sus directores, empleados y afiliados de cualquier reclamo, demanda, daño, pérdida o gasto (incluidos los honorarios legales razonables) que surjan de su uso del Servicio, su contenido o su violación de estos términos, bajo la ley de Texas.',
    },
    {
      heading: '18. Fuerza Mayor',
      body: 'THE NATIONAL BUILDERS no será responsable por fallas o demoras en el cumplimiento de sus obligaciones debido a causas fuera de su control razonable, incluidas, entre otras, desastres naturales, guerras, pandemias, fallas tecnológicas o acciones gubernamentales, de conformidad con el Código de Comercio y Negocios de Texas.',
    },
    {
      heading: '19. Ley Aplicable y Jurisdicción',
      body: 'Estos términos se rigen e interpretan de acuerdo con las leyes del Estado de Texas y la ley federal de EE. UU. aplicable. Cualquier disputa será sometida a los tribunales competentes en Texas (Código de Práctica Civil y Remedios de Texas).',
    },
    {
      heading: '20. Resolución de Disputas y Arbitraje Vinculante (Reemplaza la Sección 20 original)',
      body: '20.1. Arbitraje Vinculante: Cualquier controversia, disputa o reclamación que surja de o esté relacionada con estos Términos, el Servicio, o cualquier producto o servicio proporcionado a través del mismo, se resolverá mediante arbitraje individual vinculante ante la American Arbitration Association (AAA) de conformidad con sus Reglas de Arbitraje Comercial, con sede en el Condado de [INSERTAR NOMBRE DEL CONDADO EN TEXAS], Texas. La decisión del árbitro será definitiva y vinculante. 20.2. Renuncia a Demandas Colectivas: En la máxima medida permitida por la ley, usted y THE NATIONAL BUILDERS renuncian a cualquier derecho a litigar disputas en un tribunal ante un juez o jurado, o a participar como demandante o miembro de una clase en cualquier acción colectiva, arbitraje colectivo o acción representativa. Esto significa que cualquier disputa debe ser resuelta individualmente y no puede combinarse con las disputas de otras personas. 20.3. Excepciones: No obstante lo anterior, cualquiera de las partes podrá interponer una acción individual en un tribunal de reclamos menores (small claims court) de Texas o buscar medidas cautelares o equitativas ante un tribunal competente para proteger sus derechos de propiedad intelectual.',
    },
    {
      heading: '21. Cambios en los Términos',
      body: 'THE NATIONAL BUILDERS puede modificar estos términos y condiciones en cualquier momento. Los cambios se notificarán en el Servicio y/o por correo electrónico, y el uso continuado del Servicio después de la notificación constituye la aceptación de los nuevos términos, de acuerdo con el Código de Comercio y Negocios de Texas.',
    },
    {
      heading: '22. Términos de Licencia de la App',
      body: 'Se le otorga una licencia limitada, revocable, no exclusiva e intransferible para descargar, instalar y usar la App únicamente para fines personales y de acuerdo con estos términos. Cualquier uso no autorizado está expresamente prohibido bajo la ley de Texas.',
    },
    {
      heading: '23. Cumplimiento de la Tienda de Aplicaciones',
      body: 'Usted también acepta cumplir con los términos y condiciones de la tienda de aplicaciones desde la que descargó la App (Apple App Store, Google Play, etc.), incluidas las políticas de actualización, pago y reembolso, conforme a la ley de EE. UU..',
    },
    {
      heading: '24. Alojamiento, Entrega y Soporte',
      body: 'El Servicio y sus servicios están alojados en servidores seguros y certificados. Las notificaciones, confirmaciones de compra y entregas pueden realizarse por correo electrónico u otros medios electrónicos, de conformidad con la Ley E-SIGN y la ley de Texas. THE NATIONAL BUILDERS proporciona soporte técnico a través de los canales oficiales indicados en el Servicio.',
    },
    {
      heading: '25. Información de Contacto',
      body: 'Para consultas, soporte o quejas, contáctenos a través del Servicio o por teléfono al 1-862-277-0131. También puede escribir a la dirección de correo electrónico oficial indicada en el Servicio.',
    },
    {
      heading: '26. Política de Privacidad y Consentimiento de Datos',
      body: 'La Política de Privacidad de THE NATIONAL BUILDERS está incorporada por referencia en estos Términos y Condiciones y forma parte integral de los mismos. La Política de Privacidad describe cómo THE NATIONAL BUILDERS recopila, utiliza y protege su información personal. Al utilizar el Servicio, usted reconoce que ha leído y entendido la Política de Privacidad y acepta el procesamiento de sus datos personales de acuerdo con ella.',
    },
    {
      heading: '27. Descargo de Responsabilidad para Contenido de Construcción y Asesoramiento',
      body: 'THE NATIONAL BUILDERS no es una firma de arquitectura, ingeniería, o construcción licenciada. El Servicio puede proporcionar herramientas, estimaciones, directorios, o información general de la industria de la construcción. Dicha información se proporciona únicamente con fines informativos y no constituye asesoramiento profesional, legal, financiero, de ingeniería o de construcción. La confianza depositada por usted en cualquier información ofrecida a través del Servicio es estrictamente bajo su propio riesgo. Usted es el único responsable de contratar y supervisar a profesionales calificados y licenciados para cualquier proyecto de construcción o reparación.',
    },
  ],
};

interface TermsAndPoliciesProps {
  onClose?: () => void;
  isVisible?: boolean;
}

const TermsAndPoliciesScreen: React.FC<TermsAndPoliciesProps> = ({ onClose, isVisible = true }) => {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const currentTerms = language === 'en' ? termsAndConditions_EN : termsAndPolicies_ES;
  const params = useLocalSearchParams();

  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'en' ? 'es' : 'en'));
  };

  const handleGoBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const languageButtonColor = Theme.colors.info[100] || '#FFC107'; 
  const languageButtonTextColor = Theme.colors.text.secondary || '#333333'; 

  return (
    <>
      <StatusBar
        style="light"
        backgroundColor={Theme.colors.primary[500]}
      />
      <View style={MigratedStyles.termsAndPoliciesContainer}>
        
        <View style={
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: MigratedStyles.termsAndPoliciesContainer.paddingHorizontal,
            paddingTop: 10,
            marginBottom: 20,
          }
        }>
          
          <TouchableOpacity 
            style={MigratedStyles.termsAndPoliciesBackButton} 
            onPress={handleGoBack} 
          >
            <FontAwesome name="arrow-left" size={24} color={Theme.colors.text.primary} />
            <Text style={MigratedStyles.termsAndPoliciesBackButtonText}>
              {language === 'en' ? 'Back' : 'Atrás'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={toggleLanguage} 
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: languageButtonColor,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: languageButtonTextColor, fontWeight: 'bold', fontSize: 14 }}>
              {language === 'en' ? 'ESPAÑOL' : 'ENGLISH'}
            </Text>
            <FontAwesome name="language" size={18} color={languageButtonTextColor} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={[MigratedStyles.termsAndPoliciesContent, { paddingTop: 0 }]}>
          
          <Text style={MigratedStyles.termsAndPoliciesTitle}>{currentTerms.title}</Text>
          
          {currentTerms.sections.map((section, index) => {
            
            const isJustified = index > 0;
            
            return (
              <View key={index} style={{ marginBottom: 15 }}>
                <Text style={[MigratedStyles.termsAndPoliciesPolicyText, { fontWeight: 'bold', marginTop: 10 }]}>
                  {section.heading}
                </Text>
                
                <Text style={[
                  MigratedStyles.termsAndPoliciesPolicyText, 
                  isJustified ? { textAlign: 'justify' } : { textAlign: 'left' } 
                ]}>
                  {section.body}
                </Text>
              </View>
            );
          })}
          
        </ScrollView>
      </View>
    </>
  );
};

export default TermsAndPoliciesScreen;