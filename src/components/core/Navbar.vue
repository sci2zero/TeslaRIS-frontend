<template>
    <div id="navbar">
        <div class="nav-container">
            <div class="left-column">
                <div class="logo">
                    Logo
                </div>
                <div class="navitems">
                    <ul class="nav-items">
                        <li>
                            <div class="link-container">
                                <a href="#">Link</a>
                            </div>
                        </li>
                        <li>
                            <div class="link-container">
                                <a href="#">Link</a>
                            </div>
                        </li>
                        <li>
                            <div class="link-container">
                                <a href="#">Link</a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="right-column">
                <ul class="nav-items">
                    <li>
                        <div class="link-container">
                            <LangChangeItem />
                        </div>
                    </li>
                    <li>
                        <div class="link-container">
                            <localized-link to="login">
                                {{ $t("loginLabel") }}
                            </localized-link>
                        </div>
                    </li>
                    <li>
                        <div class="link-container">
                            <localized-link to="register">
                                {{ $t("registerLabel") }}
                            </localized-link>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import LangChangeItem from './LangChangeItem.vue';
import LocalizedLink from "../localization/LocalizedLink.vue";

export default {
    name: "NavbarHeader",
    components: { LangChangeItem, LocalizedLink }
}
</script>

<style scoped>

    #navbar {
        width: 100%;
        height: 80px;
        border-bottom: 1px #eee solid;

        .nav-container {

            display: flex;
            height: 100%;
            justify-content: space-between;

            .left-column {
                display: flex;
                height: 100%;

                .logo {
                    align-self: center;
                    margin-right: 1em;
                }
            }

            .nav-items {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                height: 100%;

                li {
                    text-decoration: none;
                    list-style: none;   

                    .link-container {
                        height: 100%;
                        display: flex;
                        align-items: center;

                        a {
                            padding: 1em 1em;
                            text-decoration: none;
                        }
                    }

                }
            }
        }
    }
</style>