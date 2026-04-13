import {cors} from "#src/cors"

export default cors()
    .allowCredentials()
    .maxAge(84600)
    .allowMethods("*")
    .allowHeaders("*")
    .allowOrigin("*")
